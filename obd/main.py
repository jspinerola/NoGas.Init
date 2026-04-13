import time
from obd_handler import OBDHandler
from db_manager import DatabaseManager
from models import ReadingSchema

def main():
    hw, db = OBDHandler(), DatabaseManager(sb_url="YOUR_URL", sb_key="YOUR_KEY")
    vin = hw.get_vin()
    
    if not (v := db.Session().query(Vehicle).filter_by(vin=vin).first()):
        db.log_reading(hw.fetch_vin_details(vin)) # Simplified for example
    
    loop_count = 0
    while True:
        # Tier 1: Every 0.5s
        payload = hw.get_tier_1()
        payload['vin'] = vin

        # Tier 2: Every 5s
        if loop_count % 10 == 0:
            payload.update(hw.get_tier_2())

        # Tier 3: Every 30s
        if loop_count % 60 == 0:
            payload.update(hw.get_tier_3())
            db.sync_to_supabase()

        db.log_reading(payload)
        loop_count += 1
        time.sleep(0.5)

if __name__ == "__main__":
    main()