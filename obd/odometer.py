# for kevin's whip
import serial
import time

# --- CONFIG ---
PORT = "COM6"
BAUD = 38400 

def send(ser, cmd, delay=0.5):
    ser.reset_input_buffer()
    ser.write((cmd + "\r").encode())
    time.sleep(delay)
    raw = ser.read(ser.in_waiting).decode(errors="ignore")
    return [l.strip() for l in raw.replace("\r", "\n").split("\n") if l.strip() and ">" not in l]

def run_nissan_scan():
    try:
        with serial.Serial(PORT, BAUD, timeout=1) as ser:
            print("--- Initializing for 2023 Nissan Kicks ---")
            send(ser, "ATZ", delay=1.2)   # Reset
            send(ser, "ATE0")             # Echo off
            send(ser, "ATSP6")            # Protocol 6 (CAN 11/500) - Nissan Standard
            send(ser, "ATH1")             # Headers ON (Helpful for multi-frame VIN)
            
            # 1. THE VIN (Mode 09, PID 02)
            # This identifies the specific Kicks for your project database
            print("\nReading VIN...")
            vin_raw = send(ser, "0902", delay=0.8)
            print(f"  Raw VIN Data: {vin_raw}")

            # 2. THE ODOMETER (Mode 01, PID A6)
            # This is the "Magic PID" that the Jetta didn't have!
            print("\nReading Odometer (Standard J1979-2)...")
            odo_raw = send(ser, "01A6")
            print(f"  Raw Odo: {odo_raw}")
            
            for line in odo_raw:
                if "41 A6" in line:
                    # Example: 41 A6 00 01 E2 40
                    # The value is a 4-byte integer representing 1/10th of a km
                    hex_val = line.split("41 A6")[-1].replace(" ", "")
                    km = int(hex_val, 16) / 10.0
                    print(f"  ✅ SUCCESS! Odometer: {km:,.1f} km ({int(km*0.621):,.0f} miles)")

            # 3. FUEL LEVEL (Mode 01, PID 2F)
            # Crucial for calculating "Miles until Empty"
            print("\nReading Fuel Level...")
            fuel_raw = send(ser, "012F")
            for line in fuel_raw:
                if "41 2F" in line:
                    hex_val = line.split("41 2F")[-1].replace(" ", "")
                    fuel_pct = (int(hex_val, 16) / 255) * 100
                    print(f"  ✅ Fuel Level: {fuel_pct:.1f}%")

            # 4. ENGINE RUN TIME (Mode 01, PID 1F)
            # Use this for "Engine Hours" tracking
            print("\nReading Engine Run Time...")
            time_raw = send(ser, "011F")
            print(f"  Current Session Run Time: {time_raw}")

    except Exception as e:
        print(f"Error: {e}")

run_nissan_scan()