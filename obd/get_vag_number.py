import obd

# Connect as usual
connection = obd.OBD("COM6")

def get_vag_part_number(header="7E0"):
    if not connection.is_connected():
        print("Not connected to the car. Check ignition!")
        return None

    # 1. Set the header (Must be bytes)
    # 7E0 = Engine, 714 = Instrument Cluster
    header_cmd = b"AT SH " + header.encode()
    connection.interface.send_and_parse(header_cmd)
    
    # 2. Request the VAG Spare Part Number (PID F1 87)
    # We send it as bytes.
    messages = connection.interface.send_and_parse(b"22 F1 87")
    
    # Combine the raw strings from the message objects
    # This turns the list of objects into one long hex string
    full_raw = "".join([m.raw() for m in messages])
    print(f"Raw Response: {full_raw}")
    
    # Split by spaces to handle the hex bytes individually
    parts = full_raw.split()
    
    # 3. Validation and Decoding
    # Success code 62 (Service 22 + 0x40) followed by the ID F1 87
    if len(parts) > 3 and parts[0] == "62" and parts[1] == "F1" and parts[2] == "87":
        # The data starts after the first 3 bytes
        hex_payload = parts[3:]
        
        # Convert each hex byte to its ASCII character equivalent
        try:
            part_number = "".join([chr(int(x, 16)) for x in hex_payload if len(x) == 2])
            return part_number.strip()
        except ValueError:
            print("Error decoding hex to ASCII.")
            return None
            
    return None

if connection.is_connected():
    # Try Engine first (7E0), then Cluster (714) if Engine returns nothing
    for module in ["7E0", "714"]:
        print(f"\nChecking module {module}...")
        v_num = get_vag_part_number(module)
        if v_num:
            print(f"--- SUCCESS ---")
            print(f"VAG Part Number: {v_num}")
            break
        else:
            print(f"No part number found on {module}")
else:
    print("Failed to connect to COM6.")