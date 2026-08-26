import logging
from src.models.event import RiskEvent, EventType
from src.models.action import ChannelType

logger = logging.getLogger(__name__)

class DiagnosisEngine:
    """
    Phase 2: Diagnosis & Strategy
    Diagnose the root cause and select the appropriate intervention.
    """
    
    def __init__(self):
        # In a real system, you would initialize LLM clients here (OpenAI, Gemini, etc.)
        pass

    def analyze_root_cause(self, event: RiskEvent) -> str:
        """
        Determine why the failure occurred using rules or an LLM.
        """
        # Mocking the LLM analysis based on event metadata
        error_code = event.metadata.get("error_code")
        
        if error_code == "insufficient_funds":
            return "Customer has insufficient funds in their account."
        elif error_code == "network_timeout":
            return "Payment gateway experienced a network timeout."
        elif event.event_type == EventType.CHECKOUT_ABANDONMENT:
            return "User dropped off at the 3DS authentication step."
        
        return "Unknown failure reason."

    def select_intervention_channel(self, event: RiskEvent, root_cause: str) -> ChannelType:
        """
        Choose the best method for recovery based on the problem.
        """
        # Rule-based fallback for the AI agent's decision making
        if event.event_type == EventType.B2B_OVERDUE:
            # High value B2B often needs a paper trail (Email) or direct conversation
            return ChannelType.EMAIL
            
        elif event.event_type == EventType.SUBSCRIPTION_FAILED:
            if "network timeout" in root_cause.lower():
                # Just retry automatically without bothering the user
                return ChannelType.RETRY
            elif "insufficient funds" in root_cause.lower():
                # Let them know via SMS to top up
                return ChannelType.SMS
                
        elif event.event_type == EventType.CHECKOUT_ABANDONMENT:
            # Regional context: Hinglish voice recovery might be highly effective for this
            if event.metadata.get("region") == "IN":
                return ChannelType.VOICE_HINGLISH
            return ChannelType.SMS

        # Default fallback
        return ChannelType.EMAIL
        
    def strategize(self, event: RiskEvent) -> tuple[str, ChannelType]:
        root_cause = self.analyze_root_cause(event)
        channel = self.select_intervention_channel(event, root_cause)
        logger.info(f"Diagnosis complete for {event.event_id}: Cause=[{root_cause}], Channel=[{channel.value}]")
        return root_cause, channel
