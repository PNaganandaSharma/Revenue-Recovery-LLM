from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChannelType(str, Enum):
    RETRY = "retry"
    EMAIL = "email"
    SMS = "sms"
    VOICE_HINGLISH = "voice_hinglish"
    NONE = "none" # e.g., if we decide not to act due to compliance

class ActionLog(BaseModel):
    action_id: str
    event_id: str
    customer_id: str
    channel: ChannelType
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
