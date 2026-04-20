from __future__ import annotations

import sqlite3
import threading
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "nogas.db"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SQLiteStore:
    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        self._lock = threading.Lock()
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        return connection

    def _initialize(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._lock, self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS vehicles (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    year INTEGER,
                    make TEXT NOT NULL,
                    model TEXT NOT NULL,
                    trim TEXT,
                    vin TEXT,
                    mileage INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS service_records (
                    id TEXT PRIMARY KEY,
                    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
                    service_date TEXT NOT NULL,
                    service_type TEXT NOT NULL,
                    description TEXT,
                    mileage INTEGER,
                    cost REAL NOT NULL DEFAULT 0,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS reminders (
                    id TEXT PRIMARY KEY,
                    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    due_date TEXT,
                    due_mileage INTEGER,
                    completed INTEGER NOT NULL DEFAULT 0,
                    completed_at TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                """
            )

    def fetchall(self, query: str, parameters: tuple[Any, ...] = ()) -> list[sqlite3.Row]:
        with self._lock, self._connect() as connection:
            rows = connection.execute(query, parameters).fetchall()
        return rows

    def fetchone(self, query: str, parameters: tuple[Any, ...] = ()) -> Optional[sqlite3.Row]:
        with self._lock, self._connect() as connection:
            row = connection.execute(query, parameters).fetchone()
        return row

    def execute(self, query: str, parameters: tuple[Any, ...] = ()) -> None:
        with self._lock, self._connect() as connection:
            connection.execute(query, parameters)
            connection.commit()

    def create_vehicle(self, payload: "VehicleCreate") -> dict[str, Any]:
        vehicle_id = str(uuid4())
        now = utc_now()
        self.execute(
            """
            INSERT INTO vehicles (
                id, user_id, year, make, model, trim, vin, mileage, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                vehicle_id,
                payload.user_id,
                payload.year,
                payload.make,
                payload.model,
                payload.trim,
                payload.vin,
                payload.mileage or 0,
                now,
                now,
            ),
        )
        return self.get_vehicle_or_404(vehicle_id)

    def get_vehicle_or_404(self, vehicle_id: str) -> dict[str, Any]:
        row = self.fetchone("SELECT * FROM vehicles WHERE id = ?", (vehicle_id,))
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        return dict(row)

    def list_vehicles(self, user_id: Optional[str] = None) -> list[dict[str, Any]]:
        if user_id:
            rows = self.fetchall("SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        else:
            rows = self.fetchall("SELECT * FROM vehicles ORDER BY created_at DESC")
        return [dict(row) for row in rows]

    def delete_vehicle(self, vehicle_id: str) -> None:
        row = self.fetchone("SELECT id FROM vehicles WHERE id = ?", (vehicle_id,))
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        self.execute("DELETE FROM vehicles WHERE id = ?", (vehicle_id,))

    def create_service_record(self, payload: "ServiceRecordCreate") -> dict[str, Any]:
        self.get_vehicle_or_404(payload.vehicle_id)
        record_id = str(uuid4())
        now = utc_now()
        self.execute(
            """
            INSERT INTO service_records (
                id, vehicle_id, service_date, service_type, description, mileage, cost, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                payload.vehicle_id,
                payload.service_date.isoformat(),
                payload.service_type,
                payload.description,
                payload.mileage,
                payload.cost,
                payload.notes,
                now,
                now,
            ),
        )
        return self.get_service_record_or_404(record_id)

    def get_service_record_or_404(self, record_id: str) -> dict[str, Any]:
        row = self.fetchone("SELECT * FROM service_records WHERE id = ?", (record_id,))
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service record not found")
        return dict(row)

    def list_service_records(
        self,
        vehicle_id: str,
        service_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_cost: Optional[float] = None,
        max_cost: Optional[float] = None,
    ) -> list[dict[str, Any]]:
        self.get_vehicle_or_404(vehicle_id)
        clauses = ["vehicle_id = ?"]
        parameters: list[Any] = [vehicle_id]

        if service_type:
            clauses.append("service_type = ?")
            parameters.append(service_type)
        if start_date:
            clauses.append("service_date >= ?")
            parameters.append(start_date.isoformat())
        if end_date:
            clauses.append("service_date <= ?")
            parameters.append(end_date.isoformat())
        if min_cost is not None:
            clauses.append("cost >= ?")
            parameters.append(min_cost)
        if max_cost is not None:
            clauses.append("cost <= ?")
            parameters.append(max_cost)

        query = f"SELECT * FROM service_records WHERE {' AND '.join(clauses)} ORDER BY service_date DESC, created_at DESC"
        return [dict(row) for row in self.fetchall(query, tuple(parameters))]

    def update_service_record(self, record_id: str, payload: "ServiceRecordUpdate") -> dict[str, Any]:
        existing = self.get_service_record_or_404(record_id)
        updates: list[str] = []
        parameters: list[Any] = []

        for field_name, field_value in payload.model_dump(exclude_unset=True).items():
            if field_name == "service_date" and field_value is not None:
                field_value = field_value.isoformat()
            updates.append(f"{field_name} = ?")
            parameters.append(field_value)

        if not updates:
            return existing

        updates.append("updated_at = ?")
        parameters.append(utc_now())
        parameters.append(record_id)

        self.execute(
            f"UPDATE service_records SET {', '.join(updates)} WHERE id = ?",
            tuple(parameters),
        )
        return self.get_service_record_or_404(record_id)

    def total_cost(self, vehicle_id: str) -> dict[str, Any]:
        self.get_vehicle_or_404(vehicle_id)
        row = self.fetchone(
            """
            SELECT COUNT(*) AS service_count, COALESCE(SUM(cost), 0) AS total_spend
            FROM service_records
            WHERE vehicle_id = ?
            """,
            (vehicle_id,),
        )
        assert row is not None
        return {
            "vehicle_id": vehicle_id,
            "service_count": int(row["service_count"]),
            "total_spend": float(row["total_spend"]),
        }

    def create_reminder(self, payload: "ReminderCreate") -> dict[str, Any]:
        self.get_vehicle_or_404(payload.vehicle_id)
        reminder_id = str(uuid4())
        now = utc_now()
        self.execute(
            """
            INSERT INTO reminders (
                id, vehicle_id, title, due_date, due_mileage, completed, completed_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)
            """,
            (
                reminder_id,
                payload.vehicle_id,
                payload.title,
                payload.due_date.isoformat() if payload.due_date else None,
                payload.due_mileage,
                now,
                now,
            ),
        )
        return self.get_reminder_or_404(reminder_id)

    def get_reminder_or_404(self, reminder_id: str) -> dict[str, Any]:
        row = self.fetchone("SELECT * FROM reminders WHERE id = ?", (reminder_id,))
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
        return dict(row)

    def list_reminders(self, vehicle_id: str, include_completed: bool = False) -> list[dict[str, Any]]:
        self.get_vehicle_or_404(vehicle_id)
        if include_completed:
            rows = self.fetchall(
                "SELECT * FROM reminders WHERE vehicle_id = ? ORDER BY completed ASC, due_date ASC, created_at DESC",
                (vehicle_id,),
            )
        else:
            today = date.today().isoformat()
            rows = self.fetchall(
                """
                SELECT * FROM reminders
                WHERE vehicle_id = ? AND completed = 0 AND (due_date IS NULL OR due_date >= ?)
                ORDER BY due_date ASC, created_at DESC
                """,
                (vehicle_id, today),
            )
        return [dict(row) for row in rows]

    def mark_reminder_done(self, reminder_id: str, completed: bool = True) -> dict[str, Any]:
        self.get_reminder_or_404(reminder_id)
        now = utc_now()
        self.execute(
            "UPDATE reminders SET completed = ?, completed_at = ?, updated_at = ? WHERE id = ?",
            (1 if completed else 0, now if completed else None, now, reminder_id),
        )
        return self.get_reminder_or_404(reminder_id)


class VehicleBase(BaseModel):
    user_id: str = Field(..., min_length=1)
    year: Optional[int] = Field(default=None, ge=1886, le=2100)
    make: str = Field(..., min_length=1)
    model: str = Field(..., min_length=1)
    trim: Optional[str] = None
    vin: Optional[str] = None
    mileage: Optional[int] = Field(default=0, ge=0)


class VehicleCreate(VehicleBase):
    pass


class ServiceRecordBase(BaseModel):
    vehicle_id: str = Field(..., min_length=1)
    service_date: date
    service_type: str = Field(..., min_length=1)
    description: Optional[str] = None
    mileage: Optional[int] = Field(default=None, ge=0)
    cost: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class ServiceRecordCreate(ServiceRecordBase):
    pass


class ServiceRecordUpdate(BaseModel):
    service_date: Optional[date] = None
    service_type: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    mileage: Optional[int] = Field(default=None, ge=0)
    cost: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None


class ReminderCreate(BaseModel):
    vehicle_id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    due_date: Optional[date] = None
    due_mileage: Optional[int] = Field(default=None, ge=0)


class ReminderCompletionUpdate(BaseModel):
    completed: bool = True


class CostSummary(BaseModel):
    vehicle_id: str
    service_count: int
    total_spend: float


def normalize_vehicle(row: dict[str, Any]) -> dict[str, Any]:
    return row


store = SQLiteStore(DATABASE_PATH)

app = FastAPI(title="NoGas.Init API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/vehicles")
def list_vehicles(user_id: Optional[str] = Query(default=None)) -> list[dict[str, Any]]:
    return [normalize_vehicle(vehicle) for vehicle in store.list_vehicles(user_id=user_id)]


@app.post("/vehicles", status_code=status.HTTP_201_CREATED)
def add_vehicle(payload: VehicleCreate) -> dict[str, Any]:
    return normalize_vehicle(store.create_vehicle(payload))


@app.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_vehicle(vehicle_id: str) -> None:
    store.delete_vehicle(vehicle_id)


@app.get("/vehicles/{vehicle_id}/records")
def vehicle_records(
    vehicle_id: str,
    service_type: Optional[str] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    min_cost: Optional[float] = Query(default=None, ge=0),
    max_cost: Optional[float] = Query(default=None, ge=0),
) -> list[dict[str, Any]]:
    return store.list_service_records(
        vehicle_id=vehicle_id,
        service_type=service_type,
        start_date=start_date,
        end_date=end_date,
        min_cost=min_cost,
        max_cost=max_cost,
    )


@app.post("/service-records", status_code=status.HTTP_201_CREATED)
def create_service_record(payload: ServiceRecordCreate) -> dict[str, Any]:
    return store.create_service_record(payload)


@app.patch("/service-records/{record_id}")
def edit_service_record(record_id: str, payload: ServiceRecordUpdate) -> dict[str, Any]:
    return store.update_service_record(record_id, payload)


@app.get("/vehicles/{vehicle_id}/costs")
def vehicle_costs(vehicle_id: str) -> CostSummary:
    return CostSummary(**store.total_cost(vehicle_id))


@app.get("/vehicles/{vehicle_id}/reminders")
def vehicle_reminders(vehicle_id: str, include_completed: bool = Query(default=False)) -> list[dict[str, Any]]:
    return store.list_reminders(vehicle_id=vehicle_id, include_completed=include_completed)


@app.post("/reminders", status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate) -> dict[str, Any]:
    return store.create_reminder(payload)


@app.patch("/reminders/{reminder_id}")
def mark_reminder_done(reminder_id: str, payload: ReminderCompletionUpdate | None = None) -> dict[str, Any]:
    completed = True if payload is None else payload.completed
    return store.mark_reminder_done(reminder_id, completed=completed)
