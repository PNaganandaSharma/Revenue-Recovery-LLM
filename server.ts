import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { RevenueRecoveryAgent } from './src/server/agent';

const agent = new RevenueRecoveryAgent();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Ingest single webhook event
  app.post('/api/webhook', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid webhook payload JSON' });
      }
      const result = agent.processWebhook(payload);
      res.json(result);
    } catch (err: any) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // Run end-to-end simulation matching run_demo.py
  app.post('/api/simulate-batch', (req, res) => {
    try {
      const results = [];

      // Event 1: Subscription failed due to network timeout
      const payload_1 = {
        id: `evt_1001_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_alice',
        status: 'failed_recurring',
        amount: 49.99,
        currency: 'USD',
        error_code: 'network_timeout',
        source: 'Stripe Billing'
      };

      // Event 2: Checkout abandoned in India region
      const payload_2 = {
        id: `evt_1002_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_bob',
        status: 'abandoned',
        amount: 1500.0,
        currency: 'INR',
        region: 'IN',
        source: 'Shopify UPI'
      };

      // Event 3: B2B Invoice Overdue
      const payload_3 = {
        id: `evt_1003_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_corp_x',
        status: 'overdue',
        amount: 5000.0,
        currency: 'USD',
        source: 'QuickBooks'
      };

      // Process first 3 events
      const res1 = agent.processWebhook(payload_1);
      results.push(res1);

      const res2 = agent.processWebhook(payload_2);
      results.push(res2);

      const res3 = agent.processWebhook(payload_3);
      results.push(res3);

      // Force Alice to have reached max contacts to demonstrate compliance block
      const alice = agent.getOrCreateCustomer('cust_alice');
      alice.contact_count = 3;

      // Event 4: Alice fails again -> blocked by compliance max contacts
      const payload_4 = {
        id: `evt_1004_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_alice',
        status: 'failed_recurring',
        amount: 49.99,
        currency: 'USD',
        error_code: 'insufficient_funds',
        source: 'Stripe Billing'
      };
      const res4 = agent.processWebhook(payload_4);
      results.push(res4);

      // Event 5: Duplicate already recovered event
      const res5 = agent.processWebhook(payload_1);
      results.push(res5);

      res.json({
        success: true,
        count: results.length,
        results,
        metrics: agent.getMetrics()
      });
    } catch (err: any) {
      console.error('Simulation error:', err);
      res.status(500).json({ error: err.message || 'Simulation failed' });
    }
  });

  // Get metrics
  app.get('/api/metrics', (req, res) => {
    res.json(agent.getMetrics());
  });

  // Get all events
  app.get('/api/events', (req, res) => {
    res.json(agent.events);
  });

  // Get all customers
  app.get('/api/customers', (req, res) => {
    res.json(Array.from(agent.customers.values()));
  });

  // Update customer
  app.patch('/api/customers/:id', (req, res) => {
    const customer = agent.customers.get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const { opted_out, contact_count, language_preference, name, email, phone } = req.body;
    if (typeof opted_out === 'boolean') customer.opted_out = opted_out;
    if (typeof contact_count === 'number') customer.contact_count = contact_count;
    if (language_preference) customer.language_preference = language_preference;
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;

    res.json(customer);
  });

  // Get audit logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(agent.compliance.auditLogs);
  });

  // Manually settle / mark recovered
  app.post('/api/resolve-event/:id', (req, res) => {
    const event = agent.events.find((e) => e.event_id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const customer = agent.getOrCreateCustomer(event.customer_id);
    if (!agent.compliance.paidEventIds.has(event.event_id)) {
      agent.compliance.recordRecovery(event, customer);
      event.recovered = true;
    }
    res.json({ success: true, event, metrics: agent.getMetrics() });
  });

  // Reset state
  app.post('/api/reset', (req, res) => {
    agent.reset();
    res.json({ success: true, message: 'Agent state reset to default' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Revenue Recovery Agent running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
