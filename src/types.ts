export type EventType =
  | 'checkout_abandonment'
  | 'subscription_failed'
  | 'payment_degradation'
  | 'b2b_overdue';

export type ChannelType =
  | 'retry'
  | 'email'
  | 'sms'
  | 'voice_hinglish'
  | 'none';

export interface RiskEvent {
  event_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  event_type: EventType;
  timestamp: string;
  metadata: Record<string, any>;
  recovered?: boolean;
}

export interface CustomerProfile {
  customer_id: string;
  name: string;
  email?: string;
  phone?: string;
  language_preference: string;
  opted_out: boolean;
  contact_count: number;
  total_paid: number;
}

export interface ActionLog {
  action_id: string;
  event_id: string;
  customer_id: string;
  channel: ChannelType;
  status: 'initiated' | 'success' | 'sent' | 'promise_to_pay' | 'skipped' | 'blocked';
  timestamp: string;
  notes?: string;
  amount?: number;
  currency?: string;
}

export interface PipelineStepLog {
  phase: number;
  name: string;
  status: 'success' | 'warning' | 'skipped' | 'info' | 'blocked';
  details: string;
  timestamp: string;
}

export interface PipelineExecutionResult {
  event: RiskEvent;
  customer: CustomerProfile;
  diagnosis: {
    root_cause: string;
    channel: ChannelType;
    reasoning?: string;
  };
  compliance: {
    passed: boolean;
    reason?: string;
  };
  action?: ActionLog;
  recovered: boolean;
  steps: PipelineStepLog[];
}

export interface RecoveryMetrics {
  total_actions: number;
  total_recovered_usd: number;
  total_recovered_inr: number;
  total_events: number;
  compliance_blocks: number;
  active_customers: number;
  channel_distribution: Record<ChannelType, number>;
  events_by_type: Record<EventType, number>;
}
