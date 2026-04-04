import obd
import time

connection = obd.OBD("COM6")

def calculate_fuel_economy(maf, speed):
    if speed <= 0 or maf <= 0:
        return 0.0
    
    # Constants
    AFR = 14.7  # Air-Fuel Ratio for Gasoline
    GAS_DENSITY = 720  # Grams per liter
    
    # 1. Calculate Liters per Hour
    lp_hour = (maf / AFR / GAS_DENSITY) * 3600
    
    # 2. Calculate L/100km
    l_100km = (lp_hour / speed) * 100
    
    # 3. Convert to MPG (US)
    # The math factor to convert L/100km to MPG is 235.215
    mpg = 235.215 / l_100km
    
    return mpg

if connection.is_connected():
    print("Calculating Real-time Mileage...")
    try:
        while True:
            # Query both sensors
            r_maf = connection.query(obd.commands.MAF)
            r_speed = connection.query(obd.commands.SPEED)

            if not r_maf.is_null() and not r_speed.is_null():
                maf_val = r_maf.value.magnitude  # grams/sec
                speed_val = r_speed.value.magnitude # km/h
                
                # We need speed in km/h for the calculation
                current_mpg = calculate_fuel_economy(maf_val, speed_val)
                
                if speed_val > 5:
                    print(f"Speed: {speed_val:.1f} km/h | MAF: {maf_val:.2f} g/s | Instant MPG: {current_mpg:.1f}")
                else:
                    # At a stop, MPG is technically 0 (or infinite L/100km)
                    # It's better to show Gallons Per Hour (GPH) when idling
                    gph = (maf_val / 14.7 / 720) * 3600 * 0.264
                    print(f"Idling... Fuel Burn: {gph:.2f} Gallons/Hour")
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        connection.close()