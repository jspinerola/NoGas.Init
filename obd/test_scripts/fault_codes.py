import obd

connection = obd.OBD("COM6")

if connection.is_connected():
    # Query for Diagnostic Trouble Codes
    response = connection.query(obd.commands.GET_DTC)
    
    if not response.is_null():
        print(f"Found {len(response.value)} fault codes:")
        for code, description in response.value:
            print(f"[{code}] - {description}")
    else:
        print("No fault codes found. Your Jetta is healthy!")
else:
    print("Connection failed.")