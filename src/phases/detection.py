import logging
from typing import List, Dict, Any
from src.models.event import RiskEvent, EventType
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class DetectionEngine:
    """
    Phase 1: Detection & Ingestion
    Monitors systems to identify where revenue is slipping away.
    """
    
    def __init__(self):
        # In a real system, this would connect to webhooks, Kafka, or polling a database
        pass

    def ingest_webhook_payload(self, payload: Dict[str, Any]) -> RiskEvent:
        """
        Simulate processing an incoming webhook from a payment gateway.
        """
        logger.info(f"Ingesting payload from {payload.get('source', 'unknown')}")
        
        # Simple mapping logic for demo purposes
        raw_status = payload.get("status")
        
        event_type = EventType.PAYMENT_DEGRADATION
        if raw_status == "abandoned":
            event_type = EventType.CHECKOUT_ABANDONMENT
        elif raw_status == "failed_recurring":
            event_type = EventType.SUBSCRIPTION_FAILED
        elif raw_status == "overdue":
            event_type = EventType.B2B_OVERDUE

        event = RiskEvent(
            event_id=payload.get("id", str(uuid.uuid4())),
            customer_id=payload.get("customer_id", "unknown"),
            amount=payload.get("amount", 0.0),
            currency=payload.get("currency", "USD"),
            event_type=event_type,
            metadata=payload
        )
        
        logger.info(f"Detected RiskEvent: {event.event_type.value} for Customer {event.customer_id}")
        return event

    def poll_for_events(self) -> List[RiskEvent]:
        """
        Simulate polling a database for new events.
        """
        # Mock returning some events
        return []
