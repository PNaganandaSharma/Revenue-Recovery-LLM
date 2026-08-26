import time
from src.main import RevenueRecoveryAgent

def run_simulation():
    agent = RevenueRecoveryAgent()

    print("=========================================")
    print("Starting Revenue Recovery Agent Demo")
    print("=========================================\n")

    # Simulate Batch of Events from a Payment Gateway
    
    # Event 1: Subscription failed due to network timeout
    payload_1 = {
        "id": "evt_1001",
        "customer_id": "cust_alice",
        "status": "failed_recurring",
        "amount": 49.99,
        "currency": "USD",
        "error_code": "network_timeout"
    }

    # Event 2: Checkout abandoned in India region
    payload_2 = {
        "id": "evt_1002",
        "customer_id": "cust_bob",
        "status": "abandoned",
        "amount": 150.00,
        "currency": "INR",
        "region": "IN"
    }
    
    # Event 3: B2B Invoice Overdue
    payload_3 = {
        "id": "evt_1003",
        "customer_id": "cust_corp_x",
        "status": "overdue",
        "amount": 5000.00,
        "currency": "USD"
    }

    # Process events
    agent.process_webhook(payload_1)
    time.sleep(1)
    
    agent.process_webhook(payload_2)
    time.sleep(1)
    
    agent.process_webhook(payload_3)
    time.sleep(1)
    
    # Simulate a compliance block: Alice's subscription fails again (she reached max contacts if it retried many times)
    # Let's force alice to have max contacts
    alice = agent.get_or_create_customer("cust_alice")
    alice.contact_count = 3 
    
    payload_4 = {
        "id": "evt_1004",
        "customer_id": "cust_alice",
        "status": "failed_recurring",
        "amount": 49.99,
        "error_code": "insufficient_funds" # Would trigger SMS normally
    }
    print(">> Simulating an event that should be blocked by compliance (max contacts)...")
    agent.process_webhook(payload_4)
    time.sleep(1)

    print(">> Simulating a duplicate event that was already recovered...")
    agent.process_webhook(payload_1)


    print("=========================================")
    print("Final Compliance & Measurement Report")
    print("=========================================")
    metrics = agent.get_metrics()
    print(f"Total Actions Logged: {metrics['total_actions']}")
    print(f"Measured Money Recovered: ${metrics['total_recovered_usd']:.2f}")
    print("=========================================")

if __name__ == "__main__":
    run_simulation()
