import crypto from 'crypto';
import {
  RiskEvent,
  EventType,
  ChannelType,
  CustomerProfile,
  ActionLog,
  PipelineExecutionResult,
  PipelineStepLog,
  RecoveryMetrics
} from '../types';

export class DetectionEngine {
  ingestWebhookPayload(payload: Record<string, any>): RiskEvent {
    const rawStatus = String(payload.status || '').toLowerCase();
    let eventType: EventType = 'payment_degradation';

    if (rawStatus === 'abandoned') {
      eventType = 'checkout_abandonment';
    } else if (rawStatus === 'failed_recurring') {
      eventType = 'subscription_failed';
    } else if (rawStatus === 'overdue') {
      eventType = 'b2b_overdue';
    } else if (rawStatus === 'degraded' || rawStatus === 'timeout') {
      eventType = 'payment_degradation';
    }

    const event: RiskEvent = {
      event_id: payload.id || `evt_${crypto.randomUUID().slice(0, 8)}`,
      customer_id: payload.customer_id || 'unknown_customer',
      amount: typeof payload.amount === 'number' ? payload.amount : parseFloat(payload.amount) || 0.0,
      currency: payload.currency || 'USD',
      event_type: eventType,
      timestamp: new Date().toISOString(),
      metadata: payload,
      recovered: false
    };

    return event;
  }
}

export class DiagnosisEngine {
  analyzeRootCause(event: RiskEvent): string {
    const errorCode = event.metadata?.error_code;
    const region = event.metadata?.region;

    if (errorCode === 'insufficient_funds') {
      return 'Customer has insufficient balance/funds in their account or card.';
    } else if (errorCode === 'network_timeout') {
      return 'Payment gateway experienced an intermittent network timeout during mandate authorization.';
    } else if (errorCode === 'card_expired') {
      return 'Customer payment card has expired or reached validity limit.';
    } else if (event.event_type === 'checkout_abandonment') {
      if (region === 'IN') {
        return 'User dropped off during Indian UPI/3DS authentication flow; high friction on mobile checkout.';
      }
      return 'User dropped off at checkout before completing payment details.';
    } else if (event.event_type === 'b2b_overdue') {
      return 'Corporate net-30 invoice term lapsed without remittance notification.';
    }

    return 'Payment anomaly detected with general processing failure.';
  }

  selectInterventionChannel(event: RiskEvent, rootCause: string): ChannelType {
    if (event.event_type === 'b2b_overdue') {
      return 'email';
    } else if (event.event_type === 'subscription_failed') {
      if (rootCause.toLowerCase().includes('network timeout')) {
        return 'retry';
      } else if (rootCause.toLowerCase().includes('insufficient funds') || rootCause.toLowerCase().includes('expired')) {
        return 'sms';
      }
    } else if (event.event_type === 'checkout_abandonment') {
      if (event.metadata?.region === 'IN' || event.currency === 'INR') {
        return 'voice_hinglish';
      }
      return 'sms';
    }

    return 'email';
  }

  strategize(event: RiskEvent): { rootCause: string; channel: ChannelType } {
    const rootCause = this.analyzeRootCause(event);
    const channel = this.selectInterventionChannel(event, rootCause);
    return { rootCause, channel };
  }
}

export class ExecutionEngine {
  executeWorkflow(event: RiskEvent, channel: ChannelType): ActionLog {
    const actionId = `act_${crypto.randomUUID().slice(0, 8)}`;
    let status: ActionLog['status'] = 'initiated';
    let notes = '';

    if (channel === 'retry') {
      status = 'success';
      notes = 'Automated smart mandate retry dispatched successfully via gateway webhook hook.';
    } else if (channel === 'email') {
      status = 'sent';
      notes = 'Formal payment reminder and one-click invoice pay link dispatched via email.';
    } else if (channel === 'sms') {
      status = 'sent';
      notes = 'SMS notification with secure instant-recharge payment link sent to customer.';
    } else if (channel === 'voice_hinglish') {
      status = 'promise_to_pay';
      notes = 'Customer answered Hinglish Voice AI call. Recorded promise-to-pay scheduled for tomorrow morning.';
    } else {
      status = 'skipped';
      notes = 'No active channel selected for execution.';
    }

    return {
      action_id: actionId,
      event_id: event.event_id,
      customer_id: event.customer_id,
      channel,
      status,
      timestamp: new Date().toISOString(),
      notes,
      amount: event.amount,
      currency: event.currency
    };
  }
}

export class ComplianceEngine {
  maxContacts: number;
  auditLogs: ActionLog[] = [];
  totalRecoveredUSD: number = 0.0;
  totalRecoveredINR: number = 0.0;
  paidEventIds: Set<string> = new Set();
  complianceBlockCount: number = 0;

  constructor(maxContactsPerDay: number = 3) {
    this.maxContacts = maxContactsPerDay;
  }

  canContact(
    customer: CustomerProfile,
    event: RiskEvent,
    channel: ChannelType
  ): { canContact: boolean; reason?: string } {
    if (this.paidEventIds.has(event.event_id)) {
      this.complianceBlockCount++;
      return {
        canContact: false,
        reason: `Event ${event.event_id} has already been recovered/settled.`
      };
    }

    // Silent retries don't contribute to customer contact fatigue
    if (channel === 'retry') {
      return { canContact: true };
    }

    if (customer.opted_out) {
      this.complianceBlockCount++;
      return {
        canContact: false,
        reason: `Customer ${customer.customer_id} has explicitly opted out of communications.`
      };
    }

    if (customer.contact_count >= this.maxContacts) {
      this.complianceBlockCount++;
      return {
        canContact: false,
        reason: `Customer ${customer.customer_id} reached maximum daily contact threshold (${this.maxContacts}).`
      };
    }

    return { canContact: true };
  }

  logAction(action: ActionLog, customer: CustomerProfile): void {
    this.auditLogs.unshift(action);

    if (action.status === 'sent' || action.status === 'promise_to_pay') {
      customer.contact_count += 1;
    }
  }

  recordRecovery(event: RiskEvent, customer: CustomerProfile): void {
    if (event.currency === 'INR') {
      this.totalRecoveredINR += event.amount;
      // Approximate USD equivalent for unified reporting (1 USD ~ 83 INR)
      this.totalRecoveredUSD += event.amount / 83.0;
    } else {
      this.totalRecoveredUSD += event.amount;
    }

    this.paidEventIds.add(event.event_id);
    customer.total_paid += event.amount;
  }
}

export class RevenueRecoveryAgent {
  detector: DetectionEngine;
  diagnoser: DiagnosisEngine;
  executor: ExecutionEngine;
  compliance: ComplianceEngine;
  customers: Map<string, CustomerProfile> = new Map();
  events: RiskEvent[] = [];

  constructor(maxContacts: number = 3) {
    this.detector = new DetectionEngine();
    this.diagnoser = new DiagnosisEngine();
    this.executor = new ExecutionEngine();
    this.compliance = new ComplianceEngine(maxContacts);
    this.seedDefaultCustomers();
  }

  private seedDefaultCustomers() {
    this.customers.set('cust_alice', {
      customer_id: 'cust_alice',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1-555-0192',
      language_preference: 'en',
      opted_out: false,
      contact_count: 0,
      total_paid: 0.0
    });

    this.customers.set('cust_bob', {
      customer_id: 'cust_bob',
      name: 'Bob Sharma',
      email: 'bob.sharma@example.in',
      phone: '+91-98765-43210',
      language_preference: 'hi-en',
      opted_out: false,
      contact_count: 0,
      total_paid: 0.0
    });

    this.customers.set('cust_corp_x', {
      customer_id: 'cust_corp_x',
      name: 'Nexus Enterprise Inc.',
      email: 'ap@nexuscorp.com',
      phone: '+1-800-555-4000',
      language_preference: 'en',
      opted_out: false,
      contact_count: 0,
      total_paid: 0.0
    });
  }

  getOrCreateCustomer(customerId: string): CustomerProfile {
    if (!this.customers.has(customerId)) {
      this.customers.set(customerId, {
        customer_id: customerId,
        name: `User_${customerId}`,
        email: `${customerId}@example.com`,
        phone: '+1-555-0000',
        language_preference: 'en',
        opted_out: false,
        contact_count: 0,
        total_paid: 0.0
      });
    }
    return this.customers.get(customerId)!;
  }

  processWebhook(payload: Record<string, any>): PipelineExecutionResult {
    const steps: PipelineStepLog[] = [];
    const now = new Date().toISOString();

    // Phase 1: Detection
    const event = this.detector.ingestWebhookPayload(payload);
    this.events.unshift(event);
    const customer = this.getOrCreateCustomer(event.customer_id);

    steps.push({
      phase: 1,
      name: 'Detection & Ingestion',
      status: 'success',
      details: `Ingested ${event.event_type} for ${customer.name} (${event.currency} ${event.amount.toFixed(2)})`,
      timestamp: now
    });

    // Phase 2: Diagnosis
    const { rootCause, channel } = this.diagnoser.strategize(event);

    steps.push({
      phase: 2,
      name: 'Diagnosis & Strategy',
      status: 'success',
      details: `Cause: ${rootCause} -> Selected Channel: ${channel.toUpperCase()}`,
      timestamp: now
    });

    // Phase 4 Pre-Check: Compliance
    const complianceCheck = this.compliance.canContact(customer, event, channel);

    if (!complianceCheck.canContact) {
      steps.push({
        phase: 4,
        name: 'Compliance Gate',
        status: 'blocked',
        details: `HALTED: ${complianceCheck.reason}`,
        timestamp: now
      });

      const blockedAction: ActionLog = {
        action_id: `act_blk_${crypto.randomUUID().slice(0, 6)}`,
        event_id: event.event_id,
        customer_id: customer.customer_id,
        channel,
        status: 'blocked',
        timestamp: now,
        notes: `Compliance Block: ${complianceCheck.reason}`,
        amount: event.amount,
        currency: event.currency
      };
      this.compliance.auditLogs.unshift(blockedAction);

      return {
        event,
        customer,
        diagnosis: { root_cause: rootCause, channel },
        compliance: { passed: false, reason: complianceCheck.reason },
        action: blockedAction,
        recovered: false,
        steps
      };
    }

    steps.push({
      phase: 4,
      name: 'Compliance Gate',
      status: 'success',
      details: 'Compliance verification passed. Under max contacts & not opted out.',
      timestamp: now
    });

    // Phase 3: Execution
    let action: ActionLog | undefined;
    let recovered = false;

    if (channel !== 'none') {
      action = this.executor.executeWorkflow(event, channel);
      this.compliance.logAction(action, customer);

      steps.push({
        phase: 3,
        name: 'Execution & Dispatch',
        status: 'success',
        details: `Dispatched via ${channel.toUpperCase()} (${action.status}): ${action.notes}`,
        timestamp: now
      });

      // If smart retry succeeded immediately, record recovery
      if (action.status === 'success') {
        this.compliance.recordRecovery(event, customer);
        event.recovered = true;
        recovered = true;

        steps.push({
          phase: 4,
          name: 'Measurement & Audit',
          status: 'success',
          details: `Revenue recovered! Added ${event.currency} ${event.amount.toFixed(2)} to recovered pool.`,
          timestamp: now
        });
      } else {
        steps.push({
          phase: 4,
          name: 'Measurement & Audit',
          status: 'info',
          details: `Action logged to audit trail. Awaiting customer payment confirmation.`,
          timestamp: now
        });
      }
    }

    return {
      event,
      customer,
      diagnosis: { root_cause: rootCause, channel },
      compliance: { passed: true },
      action,
      recovered,
      steps
    };
  }

  getMetrics(): RecoveryMetrics {
    const channelDist: Record<ChannelType, number> = {
      retry: 0,
      email: 0,
      sms: 0,
      voice_hinglish: 0,
      none: 0
    };

    this.compliance.auditLogs.forEach((log) => {
      if (log.channel in channelDist) {
        channelDist[log.channel]++;
      }
    });

    const eventDist: Record<EventType, number> = {
      checkout_abandonment: 0,
      subscription_failed: 0,
      payment_degradation: 0,
      b2b_overdue: 0
    };

    this.events.forEach((evt) => {
      if (evt.event_type in eventDist) {
        eventDist[evt.event_type]++;
      }
    });

    return {
      total_actions: this.compliance.auditLogs.length,
      total_recovered_usd: this.compliance.totalRecoveredUSD,
      total_recovered_inr: this.compliance.totalRecoveredINR,
      total_events: this.events.length,
      compliance_blocks: this.compliance.complianceBlockCount,
      active_customers: this.customers.size,
      channel_distribution: channelDist,
      events_by_type: eventDist
    };
  }

  reset(): void {
    this.customers.clear();
    this.events = [];
    this.compliance.auditLogs = [];
    this.compliance.totalRecoveredUSD = 0.0;
    this.compliance.totalRecoveredINR = 0.0;
    this.compliance.paidEventIds.clear();
    this.compliance.complianceBlockCount = 0;
    this.seedDefaultCustomers();
  }
}
