import logging
from src.models.customer import CustomerProfile
from src.models.event import RiskEvent
from src.models.action import ActionLog, ChannelType

logger = logging.getLogger(__name__)

class ComplianceEngine:
    """
    Phase 4: Compliance & Measurement (The Bar)
    Enforce stopping rules, maintain audit trail, and measure money recovered.
    """
    
    def __init__(self, max_contacts_per_day: int = 3):
        self.max_contacts = max_contacts_per_day
        # In-memory stores for demo (replace with DB)
        self.audit_logs = []
        self.total_recovered = 0.0
        self.paid_event_ids = set()

    def can_contact(self, customer: CustomerProfile, event: RiskEvent, channel: ChannelType) -> bool:
        """
        Enforce Stopping Rules: Payment received, opt-out, max contact limit.
        """
        # If they already paid this specific debt
        if event.event_id in self.paid_event_ids:
            logger.warning(f"Compliance Block: Event {event.event_id} has already been recovered.")
            return False
            
        # Silent retries do not count towards communication fatigue
        if channel == ChannelType.RETRY:
            return True
        if customer.opted_out:
            logger.warning(f"Compliance Block: Customer {customer.customer_id} has opted out.")
            return False
            
        if customer.contact_count >= self.max_contacts:
            logger.warning(f"Compliance Block: Customer {customer.customer_id} reached max contacts ({self.max_contacts}).")
            return False
            
        # If they already paid this specific debt (mock logic check)
        # return False
        
        return True

    def log_action(self, action: ActionLog, customer: CustomerProfile):
        """
        Maintain Audit Trail and update customer state.
        """
        self.audit_logs.append(action)
        logger.info(f"Audit Trail Updated: Action {action.action_id} logged.")
        
        if action.status == "sent" or action.status == "promise_to_pay":
            customer.contact_count += 1
            
        # Simulate measuring recovery if a retry succeeded immediately
        if action.status == "success":
            # For demo, we need to know the amount. 
            # We assume the action tracks back to the event amount.
            pass 
            
    def record_recovery(self, event: RiskEvent, customer: CustomerProfile):
        """
        Measure Total Money Recovered.
        """
        self.total_recovered += event.amount
        self.paid_event_ids.add(event.event_id)
        customer.total_paid += event.amount
        logger.info(f"Recovered ${event.amount:.2f}! Total Measured Recovery: ${self.total_recovered:.2f}")

    def generate_report(self) -> dict:
        return {
            "total_actions": len(self.audit_logs),
            "total_recovered_usd": self.total_recovered
        }
