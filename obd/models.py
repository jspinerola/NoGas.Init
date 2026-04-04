from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import DeclarativeBase
from pydantic import BaseModel, ConfigDict

class Base(DeclarativeBase):
    pass

class Vehicle(Base):
    __tablename__ = 'vehicles'
    id = Column(Integer, primary_key=True)
    make = Column(String(50))
    model = Column(String(50))
    year = Column(Integer)
    vin = Column(String(17), unique=True)

class OBDData(Base):
    __tablename__ = 'obd_data'
    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'))
    timestamp = Column(DateTime, default=datetime.utcnow) # Added default
    
    # Real-time
    rpm = Column(Float)
    speed = Column(Float)
    engine_load = Column(Float)
    throttle_pos = Column(Float)

    # Every 5 Seconds
    coolant_temp = Column(Float, nullable=True)
    intake_temp = Column(Float, nullable=True) # Added
    voltage = Column(Float, nullable=True)
    long_trim = Column(Float, nullable=True)

    # Every 30 seconds / On start
    dtc_codes = Column(String, nullable=True)  
    fuel_level = Column(Float, nullable=True)
    distance_w_mil = Column(Float, nullable=True) # Added
    is_synced = Column(Boolean, default=False)

class ReadingSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    vin: str
    rpm: float
    speed: float
    engine_load: float
    throttle_pos: float
    # Set all these to Optional (float | None) so Pydantic doesn't crash on Tier 1 loops
    coolant_temp: float | None = None
    intake_temp: float | None = None
    long_trim: float | None = None
    voltage: float | None = None
    fuel_level: float | None = None
    distance_w_mil: float | None = None