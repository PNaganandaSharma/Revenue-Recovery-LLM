from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class EventType(str, Enum):
    CHECKOUT_ABANDONMENT = "checkout_abandonment"
    SUBSCRIPTION_FAILED = "subscription_failed"
    PAYMENT_DEGRADATION = "payment_degradation"
    B2B_OVERDUE = "b2b_overdue"

class RiskEvent(BaseModel):
    event_id: str
    customer_id: str
    amount: float
    currency: str = "USD"
    event_type: EventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
