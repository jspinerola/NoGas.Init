import obd
import time

# 1. Increase the timeout to give the ECU more time during revs
# 2. Set 'fast=False' to ensure the library waits for a complete response
connection = obd.OBD("COM6", timeout=2, fast=False)

def get_rpm():
    if connection.is_connected():
        response = connection.query(obd.commands.RPM)
        if not response.is_null():
            return response.value.magnitude
    return None

print("Monitoring NoGas.Init... (Resilient Mode)")

try:
    consecutive_failures = 0
    while True:
        rpm = get_rpm()
        speed = connection.query(obd.commands.SPEED).value.magnitude if connection.is_connected() else None
        
        if rpm is not None:
            print(f"RPM: {rpm:.0f}")
            print(f"Speed: {speed:.1f} km/h" if speed is not None else "Speed: N/A")
            consecutive_failures = 0
        else:
            consecutive_failures += 1
            print(f"[{consecutive_failures}] Missed a heartbeat...")
            
            # If we miss 5 in a row, the protocol might have crashed
            if consecutive_failures >= 5:
                print("Connection lost. Attempting to reset protocol...")
                connection.close()
                time.sleep(2)
                connection = obd.OBD("COM6", timeout=2, fast=False)
                consecutive_failures = 0

        # Adding a slightly larger delay can help the adapter "breathe"
        time.sleep(0.5) 

except KeyboardInterrupt:
    print("\nClosing...")
    connection.close()