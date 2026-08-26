# Revenue Recovery AI Agent

An autonomous AI agent designed to monitor, diagnose, and recover lost revenue across payment gateways, subscriptions, and checkouts. It actively moves beyond simply flagging issues to executing a bounded, compliant recovery workflow.

## The 4 Phases of Recovery

1. **Detection & Ingestion:** Monitors data streams (payment gateways, checkouts) to identify risk events like abandonment or failure.
2. **Diagnosis & Strategy:** Analyzes the root cause and selects the most effective intervention channel (e.g., smart retry, email/SMS, Hinglish voice call).
3. **Execution & Recovery:** Executes the chosen workflow, tracks promises to pay, and schedules intelligent retries.
4. **Compliance & Measurement:** Enforces strict stopping rules (max contacts, paid, opted out), maintains a robust audit trail, and calculates the total measured money recovered.

## Getting Started

### Prerequisites
- Python 3.9+
- A virtual environment (recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/revenue-recovery-agent.git
   cd revenue-recovery-agent
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables:
   ```bash
   cp .env.example .env
   # Edit .env with your specific API keys
   ```

### Running the Demo

The repository includes a simulation script that demonstrates the end-to-end flow with a batch of failed transactions.

```bash
python run_demo.py
```

## Architecture

* `src/models/` - Pydantic models representing events, customers, and actions.
* `src/phases/` - Core logic for the 4 phases of the agent's workflow.
* `src/main.py` - Orchestrator that ties the phases together.
* `run_demo.py` - Demonstration script showing the system in action and calculating metrics.
