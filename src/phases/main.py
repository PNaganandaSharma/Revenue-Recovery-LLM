import logging
from typing import Dict, Any

from src.models.event import RiskEvent
from src.models.customer import CustomerProfile
from src.models.action import ChannelType

from src.phases.detection import DetectionEngine
from src.phases.diagnosis import DiagnosisEngine
from src.phases.execution import ExecutionEngine
from src.phases.compliance import ComplianceEngine

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("AgentOrchestrator")

class RevenueRecoveryAgent:
    """
    Main Orchestrator tying together the 4 phases.
    """
    def __init__(self):
        self.detector = DetectionEngine()
        self.diagnoser = DiagnosisEngine()
        self.executor = ExecutionEngine()
        self.compliance = ComplianceEngine(max_contacts_per_day=3)
        
        # Mock customer database
        self.customers: Dict[str, CustomerProfile] = {}

    def get_or_create_customer(self, customer_id: str) -> CustomerProfile:
        if customer_id not in self.customers:
            self.customers[customer_id] = CustomerProfile(customer_id=customer_id, name=f"User_{customer_id}")
        return self.customers[customer_id]

    def process_webhook(self, payload: Dict[str, Any]):
        """
        End-to-end pipeline for processing a risk event.
        """
        logger.info("--- Starting Recovery Pipeline ---")
        
        # Phase 1: Detection
        event = self.detector.ingest_webhook_payload(payload)
        customer = self.get_or_create_customer(event.customer_id)
        
        # Phase 2: Diagnosis & Strategy
        root_cause, channel = self.diagnoser.strategize(event)

        # Phase 4 Pre-Check: Compliance Enforce Stopping Rules
        if not self.compliance.can_contact(customer, event, channel):
            logger.info(f"Pipeline Halted: Compliance rules prevented {channel.value} for {customer.customer_id}")
            return

        # Phase 3: Execution
        if channel != ChannelType.NONE:
            action = self.executor.execute_workflow(event, channel)
            
            # Phase 4: Audit & Measurement
            self.compliance.log_action(action, customer)
            
            if action.status == "success":
                self.compliance.record_recovery(event, customer)
        else:
            logger.info("Diagnosis suggested no channel. Halting pipeline.")
            
        logger.info("--- Pipeline Complete ---\n")
        
    def get_metrics(self):
        return self.compliance.generate_report()
