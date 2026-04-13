import time
from obd_handler import OBDHandler
from db_handler import DatabaseHandler

def main():
    hw = OBDHandler() 
    db = DatabaseHandler(sqlite_path="sqlite:///local.db")
    
    if not hw.is_connected(): return

    vin = hw.get_vin()
    v_id = db.get_or_create_vehicle(vin, hw)
    print(f"Logging for: {vin}")

    loop_count = 0
    trip_dist_km = 0.0
    last_time = time.time()
    
    try:
        while True:
            # 1. Gather Data (Strictly through the Handler)
            payload = hw.get_tier_1()
            
            # 2. Add Math (Still uses data from payload)
            dt = (time.time() - last_time) / 3600
            if payload['speed']:
                trip_dist_km += payload['speed'] * dt
            
            payload['trip_distance_km'] = round(trip_dist_km, 4)
            payload['calculated_mpg'] = hw.calculate_mpg(payload['maf'], payload['speed'])

            # 3. Scheduled Tier Updates
            if loop_count % 10 == 0:
                payload.update(hw.get_tier_2())
                
            if loop_count % 60 == 0:
                payload.update(hw.get_tier_3())
                print(f"Trip: {payload['trip_distance_km']}km | MPG: {payload['calculated_mpg']}")

            # 4. Save
            db.log_reading(payload, v_id)
            
            last_time = time.time()
            loop_count += 1
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print(f"Done. Trip: {round(trip_dist_km, 2)}km")

if __name__ == "__main__":
    main()