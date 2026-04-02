import obd

connection = obd.OBD("COM6")

if connection.is_connected():
    print(f"{'COMMAND NAME':<25} | {'DESCRIPTION'}")
    print("-" * 60)
    
    # This loop iterates through everything your car supports
    for cmd in connection.supported_commands:
        print(f"{cmd.name:<25} | {cmd.desc}")
else:
    print("Not connected.")