import obd
import requests

class OBDHandler:
    def __init__(self, port=None):
        self.connection = obd.OBD("COM6", timeout=2, fast=False)

    def get_vin(self):
        res = self.connection.query(obd.commands.VIN)
        if not res.value:
            return "UNKNOWN"
        
        # Convert bytearray to string and strip null bytes/junk
        if isinstance(res.value, (bytes, bytearray)):
            vin_str = res.value.decode('utf-8', errors='ignore')
        else:
            vin_str = str(res.value)
            
        return vin_str.strip('\x00').strip()

    def fetch_vin_details(self, vin):
        url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json"
        data = requests.get(url).json()['Results'][0]
        return {"make": data['Make'], "model": data['Model'], "year": int(data['ModelYear'] or 0)}
  
    def is_connected(self):
        return self.connection.is_connected()
  
    def get_tier_1(self):
        """High frequency: Performance & Fuel Math"""
        return {
            "rpm": self._query(obd.commands.RPM),
            "speed": self._query(obd.commands.SPEED),
            "engine_load": self._query(obd.commands.ENGINE_LOAD),
            "throttle_pos": self._query(obd.commands.THROTTLE_POS),
            "maf": self._query(obd.commands.MAF) # Moved here for MPG math
        }

    def get_tier_2(self):
        """Medium frequency: Health & Misfires"""
        return {
            "coolant_temp": self._query(obd.commands.COOLANT_TEMP),
            "intake_temp": self._query(obd.commands.INTAKE_TEMP),
            "voltage": self._query(obd.commands.ELM_VOLTAGE),
            "misfire_cyl1": self._query(obd.commands.MONITOR_MISFIRE_CYLINDER_1),
            "misfire_cyl2": self._query(obd.commands.MONITOR_MISFIRE_CYLINDER_2)
        }

    def get_tier_3(self):
        """Low frequency: Long-term Maintenance"""
        return {
            "fuel_level": self._query(obd.commands.FUEL_LEVEL),
            "warmups": self._query(obd.commands.WARMUPS_SINCE_DTC_CLEAR),
            "dist_since_clear": self._query(obd.commands.DISTANCE_SINCE_DTC_CLEAR)
        }

    def calculate_mpg(self, maf, speed_kmh):
        """Internal helper for fuel economy"""
        if not maf or not speed_kmh or speed_kmh < 5:
            return 0
        vss_mph = speed_kmh * 0.621371
        mpg = (14.7 * 6.17 * 454.0 * vss_mph) / (3600.0 * maf)
        return round(mpg, 2)

    def _query(self, cmd):
        res = self.connection.query(cmd)
        if res.value is None: return None
        return res.value.magnitude if hasattr(res.value, 'magnitude') else res.value