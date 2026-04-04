import obd
import time

# Use the port you've confirmed works
connection = obd.OBD("COM6")

def scan_uds_range(header_str, start_hex, end_hex):
    if not connection.is_connected():
        print("Not connected to the car. Is the ignition on?")
        return

    print(f"--- Starting Sweep on Module {header_str} ---")
    
    # 1. Set the Header (Must be bytes)
    # We encode the string '714' into bytes
    header_cmd = b"AT SH " + header_str.encode()
    connection.interface.send_and_parse(header_cmd)
    
    for i in range(start_hex, end_hex):
        # Convert the number to a 4-digit Hex ID (e.g., 2203)
        did = hex(i)[2:].zfill(4).upper()
        
        # 2. Build the command as bytes: b"22 22 03"
        command = f"22 {did[0:2]} {did[2:4]}".encode()
        
        # 3. Use the method found in your obd.py source
        # This returns a list of OBDMessage objects
        messages = connection.interface.send_and_parse(command)
        
        if messages:
            # Join the raw strings from all returned message objects
            # m.raw() is the exact string returned by the iCarPro
            full_response = "".join([m.raw() for m in messages]).replace(" ", "")
            
            # '62' is the success code for UDS Service 22
            if "62" in full_response and "7F" not in full_response:
                print(f"✨ DATA FOUND at ID {did}: {full_response}")
                with open("found_pids.txt", "a") as f:
                    f.write(f"Header {header_str} | ID {did}: {full_response}\n")
        
        # Pause to prevent the Jetta's CAN bus from getting "flooded"
        time.sleep(0.02)

# Start the scan
scan_uds_range("714", 0x2200, 0x2400)

connection.close()