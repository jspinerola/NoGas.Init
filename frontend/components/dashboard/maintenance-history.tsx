"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronRight, Calendar, DollarSign, MapPin } from "lucide-react";

interface MaintenanceRecord {
  id: string;
  date: string;
  services: string[];
  totalCost: number;
  shop: string;
  mileage: number;
}


// TODO: we can store all values as JSON based on the user's input in a React Hook Form with Zod
// we are gonna need to make connection to Supabase with a table to test that out
const mockHistory: MaintenanceRecord[] = [
  {
    id: "1",
    date: "2026-03-15",
    services: ["Oil Change", "Tire Rotation"],
    totalCost: 125.0,
    shop: "QuickLube Auto",
    mileage: 44980,
  },
  {
    id: "2",
    date: "2026-02-01",
    services: ["Brake Inspection", "Brake Pads Replacement"],
    totalCost: 450.0,
    shop: "City Auto Service",
    mileage: 43500,
  },
  {
    id: "3",
    date: "2026-01-10",
    services: ["Air Filter", "Cabin Filter"],
    totalCost: 85.0,
    shop: "QuickLube Auto",
    mileage: 42200,
  },
  {
    id: "4",
    date: "2025-12-05",
    services: ["Full Synthetic Oil Change"],
    totalCost: 89.99,
    shop: "Precision Auto Care",
    mileage: 40800,
  },
  {
    id: "5",
    date: "2025-11-20",
    services: ["Tire Replacement", "Wheel Alignment"],
    totalCost: 780.0,
    shop: "Tire Kingdom",
    mileage: 39500,
  },
];

// Mobile card view for each record
function MobileHistoryCard({ record }: { record: MaintenanceRecord }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(record.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <span className="text-lg font-bold text-primary">
          ${record.totalCost.toFixed(2)}
        </span>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-1">
        {record.services.map((service) => (
          <Badge key={service} variant="secondary" className="text-xs">
            {service}
          </Badge>
        ))}
      </div>
      
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {record.shop}
        </div>
        <span>{record.mileage.toLocaleString()} mi</span>
      </div>
    </div>
  );
}

export function MaintenanceHistory() {
  const [sortByPrice, setSortByPrice] = useState<"asc" | "desc">("desc");

  const sortedHistory = [...mockHistory].sort((a, b) =>
    sortByPrice === "desc" ? b.totalCost - a.totalCost : a.totalCost - b.totalCost
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-foreground">Maintenance History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortByPrice(sortByPrice === "desc" ? "asc" : "desc")}
          className="w-full gap-2 sm:w-auto"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="sm:hidden">Sort: {sortByPrice === "desc" ? "High-Low" : "Low-High"}</span>
          <span className="hidden sm:inline">Sort by Price ({sortByPrice === "desc" ? "High-Low" : "Low-High"})</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Mobile view: Cards */}
        <div className="space-y-3 md:hidden">
          {sortedHistory.map((record) => (
            <MobileHistoryCard key={record.id} record={record} />
          ))}
        </div>

        {/* Desktop view: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Services</TableHead>
                <TableHead className="text-muted-foreground">Shop</TableHead>
                <TableHead className="text-muted-foreground">Mileage</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Total Cost
                </TableHead>
                <TableHead className="text-muted-foreground w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((record) => (
                <TableRow key={record.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {record.services.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.shop}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.mileage.toLocaleString()} mi
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ${record.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
