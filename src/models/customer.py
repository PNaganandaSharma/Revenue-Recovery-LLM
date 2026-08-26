from pydantic import BaseModel, Field
from typing import Optional

class CustomerProfile(BaseModel):
    customer_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    language_preference: str = "en"
    
    # State tracking for compliance
    opted_out: bool = False
    contact_count: int = 0
    total_paid: float = 0.0
