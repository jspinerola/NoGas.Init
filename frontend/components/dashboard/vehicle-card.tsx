"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Pencil } from "lucide-react";
import { AddVehicle } from "../forms/car-form";
import { AddService } from "../forms/service-form";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Vehicle } from "@/app/types/vehicle";
import { Service } from "@/app/types/service";

interface VehicleCardProps {
  vehicles: Vehicle[];
  services: Service[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddService: (service: Service) => void;
}

/* ---------------- TABLE ---------------- */

const columns: ColumnDef<Service>[] = [
  { accessorKey: "taskName", header: "Task" },
  {
    accessorKey: "odometerService",
    header: "Mileage",
    cell: ({ row }) =>
      `${row.original.odometerService.toLocaleString()} mi`,
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => `$${row.original.cost}`,
  },
  {
    accessorKey: "completedDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.completedDate).toLocaleDateString(),
  },
];

function ServiceTable({ data }: { data: Service[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                No services recorded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export function VehicleCard({
  vehicles,
  services,
  onAddVehicle,
  onAddService,

}: VehicleCardProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
    
      {vehicles.map((vehicle) => {
        const vehicleServices = services.filter(
          (s) => Number(s.carId) === vehicle.id
        );

        const isOpen = openId === vehicle.id;

        return (
          <Card
            key={vehicle.id}
            className="mt-4 bg-card border-border"
          >
            {/* HEADER */}
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
                  asChild
                >
                  <Link href="/garage">View All</Link>
                </Button>
              </div>
            </CardHeader>

            {/* CONTENT */}
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* ICON */}
                <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:mx-0 sm:h-44 sm:w-44">
                  <Car className="h-10 w-10 text-primary sm:h-20 sm:w-20" />
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-3 text-center sm:text-left sm:text-xl">
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <h3 className="text-lg font-bold sm:text-xl">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    {vehicle.isDefault && (
                      <Badge className="bg-primary/20 text-primary">
                        Default
                      </Badge>
                    )}
                  </div>

                  {/* GRID */}
                  <div className="grid grid-cols-2 gap-3 text-left sm:gap-4 md:grid-cols-4">
                    <Info label="License Plate" value={vehicle.licensePlate} />
                    <Info
                      label="Mileage"
                      value={`${vehicle.miles.toLocaleString()} mi`}
                    />
                    <Info label="Year" value={vehicle.year} />
                    <Info
                      label="VIN"
                      value={`${vehicle.vinPrefix.slice(0, 8)}...`}
                    />
                    <Info label="MPG" value={vehicle.mpg} />
                    <Info
                      label="Next Service"
                      value={vehicle.nextService.toDateString()}
                    />
                  </div>
                </div>
              </div>

              {/* TABLE */}
              {isOpen && (
                <div className="mt-6">
                  <ServiceTable data={vehicleServices} />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}

/* ---------------- HELPER ---------------- */

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3 sm:bg-transparent sm:p-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}