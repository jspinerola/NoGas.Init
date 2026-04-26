"use client";

import { useEffect, useState } from "react";
import { VehicleCard } from "@/components/dashboard/vehicle-card";
import { Vehicle } from "@/app/types/vehicle";
import { Service } from "@/app/types/service";

const VEHICLES_KEY = "garage_vehicles";
const SERVICES_KEY = "garage_services";

export default function DashboardClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(VEHICLES_KEY);
    const s = localStorage.getItem(SERVICES_KEY);

    if (v) {
      const parsed = JSON.parse(v).map((veh: any) => ({
        ...veh,
        nextService: veh.nextService
          ? new Date(veh.nextService)
          : new Date(),
      }));
      setVehicles(parsed);
    }

    if (s) {
      const parsed = JSON.parse(s).map((srv: any) => ({
        ...srv,
        completedDate: new Date(srv.completedDate),
      }));
      setServices(parsed);
    }

    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const defaultVehicle = vehicles.find((v) => v.isDefault);

  if (!defaultVehicle) {
    return (
      <p className="text-muted-foreground">
        No default vehicle selected.
      </p>
    );
  }

  return (
    <VehicleCard
      vehicles={[defaultVehicle]} 
      services={services}
      onAddVehicle={() => {}}
      onAddService={() => {}}
    />
  );
}