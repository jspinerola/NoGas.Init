"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Edit2 } from "lucide-react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate: string;
  vin: string;
  isDefault: boolean;
}

const mockVehicle: Vehicle = {
  id: "1",
  make: "Nissan",
  model: "Kicks",
  year: 2023,
  mileage: 59238,
  licensePlate: "ABC 1234",
  vin: "1HGBH41JXMN109186",
  isDefault: true,
};

export function VehicleCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-foreground">My Vehicle</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-2 sm:flex-none">
            <Edit2 className="h-4 w-4" />
            <span className="sm:inline">View All</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mx-0 sm:h-24 sm:w-24">
            <Car className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h3 className="text-lg font-bold text-foreground sm:text-xl">
                {mockVehicle.year} {mockVehicle.make} {mockVehicle.model}
              </h3>
              {mockVehicle.isDefault && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Default
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-left sm:gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                <p className="text-xs text-muted-foreground">License Plate</p>
                <p className="font-medium text-foreground">{mockVehicle.licensePlate}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                <p className="text-xs text-muted-foreground">Current Mileage</p>
                <p className="font-medium text-foreground">
                  {mockVehicle.mileage.toLocaleString()} mi
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="font-medium text-foreground">{mockVehicle.year}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="font-mono text-xs text-foreground sm:text-sm">
                  {mockVehicle.vin.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
