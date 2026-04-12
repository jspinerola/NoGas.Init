"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Droplets,
  Disc,
  RotateCcw,
  Wind,
  Zap,
  Snowflake,
  Car,
  Wrench,
} from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  lastService: string;
  nextDue: string;
  status: "good" | "due-soon" | "overdue";
}

// TODO: we can store all values as JSON based on the user's input in a React Hook Form with Zod
// we are gonna need to make connection to Supabase with a table to test that out
const serviceTypes: ServiceType[] = [
  {
    id: "oil",
    name: "Oil Change",
    icon: Droplets,
    lastService: "Mar 15, 2026",
    nextDue: "Jun 15, 2026",
    status: "good",
  },
  {
    id: "brakes",
    name: "Brake Service",
    icon: Disc,
    lastService: "Feb 1, 2026",
    nextDue: "Aug 1, 2026",
    status: "good",
  },
  {
    id: "tire-rotation",
    name: "Tire Rotation",
    icon: RotateCcw,
    lastService: "Mar 15, 2026",
    nextDue: "Apr 15, 2026",
    status: "due-soon",
  },
  {
    id: "air-filter",
    name: "Air Filter",
    icon: Wind,
    lastService: "Jan 10, 2026",
    nextDue: "Jul 10, 2026",
    status: "good",
  },
  {
    id: "battery",
    name: "Battery",
    icon: Zap,
    lastService: "Sep 20, 2025",
    nextDue: "Mar 20, 2026",
    status: "overdue",
  },
  {
    id: "ac",
    name: "A/C Service",
    icon: Snowflake,
    lastService: "Jun 5, 2025",
    nextDue: "Jun 5, 2026",
    status: "good",
  },
  {
    id: "transmission",
    name: "Transmission",
    icon: Car,
    lastService: "Aug 15, 2025",
    nextDue: "Aug 15, 2027",
    status: "good",
  },
  {
    id: "general",
    name: "General Service",
    icon: Wrench,
    lastService: "Dec 1, 2025",
    nextDue: "Jun 1, 2026",
    status: "good",
  },
];

const filterOptions = ["All", "Oil", "Brakes", "Tires", "Filters", "Other"];

export function ServicesGrid() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredServices = serviceTypes.filter((service) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Oil") return service.id === "oil";
    if (activeFilter === "Brakes") return service.id === "brakes";
    if (activeFilter === "Tires") return service.id === "tire-rotation";
    if (activeFilter === "Filters") return service.id === "air-filter";
    return !["oil", "brakes", "tire-rotation", "air-filter"].includes(service.id);
  });

  const getStatusColor = (status: ServiceType["status"]) => {
    switch (status) {
      case "good":
        return "bg-primary/20 text-primary border-primary/30";
      case "due-soon":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30";
      case "overdue":
        return "bg-destructive/20 text-destructive border-destructive/30";
    }
  };

  const getStatusText = (status: ServiceType["status"]) => {
    switch (status) {
      case "good":
        return "Good";
      case "due-soon":
        return "Due Soon";
      case "overdue":
        return "Overdue";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-foreground">Service Types</CardTitle>
          {/* Mobile: Horizontal scroll filter */}
          <ScrollArea className="w-full sm:hidden">
            <div className="flex gap-2 pb-2">
              {filterOptions.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "shrink-0 min-w-[4rem]",
                    activeFilter === filter && "bg-primary text-primary-foreground"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {/* Desktop: Wrap filter */}
          <div className="hidden flex-wrap gap-2 sm:flex">
            {filterOptions.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  activeFilter === filter && "bg-primary text-primary-foreground"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 hover:bg-secondary sm:p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                  <service.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] sm:text-xs", getStatusColor(service.status))}
                >
                  {getStatusText(service.status)}
                </Badge>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground sm:mt-3 sm:text-base">
                {service.name}
              </h3>
              <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground sm:mt-2 sm:space-y-1 sm:text-xs">
                <p>Last: {service.lastService}</p>
                <p>Next: {service.nextDue}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
