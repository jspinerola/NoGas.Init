"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { carSchema } from "@/components/forms/schemas/car.schema";
import { AddVehicle } from "../forms/car-form";


interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  licensePlate: string;
  vinPrefix: string;
  isDefault: boolean;
  mpg: number;
  nextService: Date;
}

// this component is used as a global component to display all cars in the cars view, whereas the vehicle-card only shows one 
// there's a better way of doing this but I'm just lazy :p

// TODO: we can store all values as JSON based on the user's input in a React Hook Form with Zod
// we are gonna need to make connection to Supabase with a table to test that out

// TODO: add delete & edit functions on car info and update the forms to also 
// convey the next service 
const initialVehicles: Vehicle[] = [
  {
    id: "1",
    name: "Bob",
    make: "Nissan",
    model: "Kicks",
    year: 2023,
    miles: 59238,
    licensePlate: "ABC 1234",
    vinPrefix: "1HGBH41JXMN109186",
    mpg: 28.5,
    nextService: new Date (2026, 0, 6),
    isDefault: true,
  },
  {
    id: "2",
    name: "Alice",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    miles: 45000,
    licensePlate: "XYZ 5678",
    vinPrefix: "4T1BF1AK5CU123456",
    mpg: 32.0,
    nextService: new Date (2025, 6, 15),
    isDefault: false,
  },
];

const formSchema = z.object({
    car: carSchema
});
    
export type carValues = z.infer<typeof formSchema>

export function VehicleCard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  return (
    <>
    <AddVehicle
      onAddVehicle={(newVehicle) =>
        setVehicles((prev) => [...prev, newVehicle])
      }
    />
    {vehicles.map((mockVehicle) =>
        <Card key={mockVehicle.id} className="bg-card border-border">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-foreground">Vehicle: <span className="text-primary">{mockVehicle.name}</span></CardTitle>
                <div className="flex gap-2">
                
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mx-0 sm:h-44 sm:w-44">
                    <Car className="h-10 w-10 text-primary sm:h-20 sm:w-20" />
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left sm:text-xl">
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
                        <p className="text-xs text-muted-foreground">Current miles</p>
                        <p className="font-medium text-foreground">
                        {mockVehicle.miles.toLocaleString()} mi
                        </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground">Year</p>
                        <p className="font-medium text-foreground">{mockVehicle.year}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground">VIN</p>
                        <p className="font-mono text-xs text-foreground sm:text-xl">
                        {mockVehicle.vinPrefix.slice(0, 8)}...
                        </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground">MPG</p>
                        <p className="font-mono text-xs text-foreground sm:text-xl">
                        {mockVehicle.mpg}
                        </p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground">Next Service</p>
                        <p className="font-mono text-xs text-foreground sm:text-xl">
                        {mockVehicle.nextService.toDateString()}
                        </p>
                    </div>
                    </div>
                </div>
                </div>
            </CardContent>
        </Card>
        )}
    </>
  );
}
