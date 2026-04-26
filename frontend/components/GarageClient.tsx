"use client";

import { useEffect, useState } from "react";
import { VehicleCard } from "./cards/vehicle";
import { Vehicle } from "@/app/types/vehicle";
import { Service } from "@/app/types/service";

const VEHICLES_KEY = "garage_vehicles";
const SERVICES_KEY = "garage_services";

export default function GarageClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const setDefaultVehicle = (id: number) => {
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }))
    );
  };

  /* ---------------- LOAD FROM LOCAL ---------------- */
  useEffect(() => {
    const storedVehicles = localStorage.getItem(VEHICLES_KEY);
    const storedServices = localStorage.getItem(SERVICES_KEY);

    if (storedVehicles) {
      const parsedVehicles: Vehicle[] = JSON.parse(storedVehicles).map(
        (v: any) => ({
          ...v,
          nextService: v.nextService ? new Date(v.nextService) : new Date(),
        })
      );
      setVehicles(parsedVehicles);
    }

    if (storedServices) {
      const parsedServices: Service[] = JSON.parse(storedServices).map(
        (s: any) => ({
          ...s,
          completedDate: new Date(s.completedDate),
        })
      );
      setServices(parsedServices);
    }

    setIsLoaded(true);
  }, []);

  /* ---------------- SAVE TO LOCAL ---------------- */
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  }, [vehicles, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }, [services, isLoaded]);

  /* ---------------- HANDLERS ---------------- */
  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles((prev) => {
      // if new vehicle is default → remove default from others
      if (vehicle.isDefault) {
        return [
          ...prev.map((v) => ({ ...v, isDefault: false })),
          vehicle,
        ];
      }

      // if no vehicles yet → force first one to be default
      if (prev.length === 0) {
        return [{ ...vehicle, isDefault: true }];
      }

      return [...prev, vehicle];
    });
  };

  const handleAddService = (service: Service) => {
    setServices((prev) => [...prev, service]);
  };

  /* ---------------- UI ---------------- */
  if (!isLoaded) return null; // prevents hydration mismatch

  return (
    <VehicleCard
      vehicles={vehicles}
      services={services}
      onAddVehicle={handleAddVehicle}
      onAddService={handleAddService}
      onSetDefault={setDefaultVehicle}
    />
  );
}