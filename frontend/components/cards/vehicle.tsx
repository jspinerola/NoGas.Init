"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { AddVehicle } from "../forms/car-form";
import { AddService } from "../forms/service-form";
import { Vehicle } from "@/app/types/vehicle";
import { Service } from "@/app/types/service";

interface VehicleCardProps {
  vehicles: Vehicle[];
  services: Service[]; 
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddService: (service: Service) => void;
  onSetDefault: (id: number) => void;
}

export function VehicleCard({
  vehicles,
  services,
  onAddVehicle,
  onAddService,
  onSetDefault,
}: VehicleCardProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <AddVehicle onAddVehicle={onAddVehicle} />

        <AddService
          vehicles={vehicles}
          onAddService={onAddService}
        />
      </div>

      {vehicles.map((vehicle) => {
        const vehicleServices = services.filter(
          (s) => Number(s.carId) === vehicle.id
        );

        const isOpen = openId === vehicle.id;

        return (
          <Card
            key={vehicle.id}
            className="bg-card border-border mt-4"
          >
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-foreground">
                Vehicle:{" "}
                <span className="text-primary">{vehicle.name}</span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setOpenId(isOpen ? null : vehicle.id)
                  }
                >
                  {isOpen ? "Hide Services" : "View Services"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onSetDefault(vehicle.id)}
                >
                  Set Default
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* Icon */}
                <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mx-0 sm:h-44 sm:w-44">
                  <Car className="h-10 w-10 text-primary sm:h-20 sm:w-20" />
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 space-y-3 text-center sm:text-left sm:text-xl">
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {vehicle.isDefault && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left sm:gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        License Plate
                      </p>
                      <p className="font-medium text-foreground">
                        {vehicle.licensePlate}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        Current Mileage
                      </p>
                      <p className="font-medium text-foreground">
                        {vehicle.miles.toLocaleString()} mi
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        Year
                      </p>
                      <p className="font-medium text-foreground">
                        {vehicle.year}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        VIN
                      </p>
                      <p className="font-mono text-xs text-foreground sm:text-xl">
                        {vehicle.vinPrefix.slice(0, 8)}...
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        MPG
                      </p>
                      <p className="font-mono text-xs text-foreground sm:text-xl">
                        {vehicle.mpg}
                      </p>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                      <p className="text-xs text-muted-foreground">
                        Next Service
                      </p>
                      <p className="font-mono text-xs text-foreground sm:text-xl">
                        {vehicle.nextService.toDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔽 Service Dropdown */}
              {isOpen && (
                <div className="mt-6 border rounded-lg p-4 bg-secondary/30">
                  <h4 className="font-semibold mb-3 text-foreground">
                    Service History
                  </h4>

                  {vehicleServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No services recorded yet.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="pb-2">Task</th>
                          <th className="pb-2">Mileage</th>
                          <th className="pb-2">Cost</th>
                          <th className="pb-2">Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {vehicleServices.map((s) => (
                          <tr key={s.id} className="border-t">
                            <td className="py-2">{s.taskName}</td>
                            <td>{s.odometerService}</td>
                            <td>${s.cost}</td>
                            <td>
                              {new Date(
                                s.completedDate
                              ).toDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}