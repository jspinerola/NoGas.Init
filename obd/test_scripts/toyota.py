import serial
import time

# Toyota usually uses 500kbps CAN (Protocol 6)
with serial.Serial("COM6", 38400, timeout=0.1) as ser:
    ser.write(b"ATZ\r")     # Reset
    time.sleep(1)
    ser.write(b"ATSP6\r")   # Set Protocol to ISO 15765-4
    ser.write(b"ATH1\r")    # Show Headers
    ser.write(b"ATMA\r")    # Monitor All (The Sniff Command)
    
    print("Listening to RAV4 heartbeats... (Press Ctrl+C to stop)")
    try:
        while True:
            line = ser.readline().decode(errors='ignore').strip()
            if line:
                print(line)
    except KeyboardInterrupt:
        ser.write(b"\r") # Stop the monitor
        print("Stopped.")