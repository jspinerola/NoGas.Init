from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, ReadingSchema, Vehicle, OBDData
from supabase import create_client

class DatabaseHandler:
    def __init__(self, sqlite_path="sqlite:///local.db", sb_url=None, sb_key=None):
        self.engine = create_engine(sqlite_path)
        self.Session = sessionmaker(bind=self.engine)
        Base.metadata.create_all(self.engine)
        # self.supabase = create_client(sb_url, sb_key) if sb_url else None

    def get_or_create_vehicle(self, vin, hw_handler):
        """Returns the internal ID for a VIN, creating the record if missing."""
        with self.Session() as s:
            vehicle = s.query(Vehicle).filter_by(vin=vin).first()
            if not vehicle:
                print(f"New VIN {vin} detected. Fetching specs...")
                details = hw_handler.fetch_vin_details(vin)
                vehicle = Vehicle(vin=vin, **details)
                s.add(vehicle)
                s.commit()
                s.refresh(vehicle) # Get the new ID
            return vehicle.id

    def log_reading(self, data, vehicle_id):
        with self.Session() as s:
            # 1. Clean the incoming data
            clean_data = data.copy()
            clean_data.pop('vin', None)
            
            # 2. Safety Check: Only keep keys that are actual columns in the DB
            valid_columns = OBDData.__table__.columns.keys()
            final_payload = {k: v for k, v in clean_data.items() if k in valid_columns}
            
            # 3. Save
            new_entry = OBDData(vehicle_id=vehicle_id, **final_payload)
            s.add(new_entry)
            s.commit()

    def sync_to_supabase(self):
        if not self.supabase: return
        with self.Session() as s:
            rows = s.query(OBDData).filter_by(is_synced=False).limit(50).all()
            if rows:
                payload = [ReadingSchema.model_validate(r).model_dump() for r in rows]
                self.supabase.table("readings").insert(payload).execute()
                for r in rows: r.is_synced = True
                s.commit()