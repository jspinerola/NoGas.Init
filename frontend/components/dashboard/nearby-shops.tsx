"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Phone, ExternalLink } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  hours: string;
  phone: string;
  isRecommended: boolean;
  specialties: string[];
}

// CHORE: honestly all of this can be rewritten to only show the `nearby car shops` based on the given Zip code 
const nearbyShops: Shop[] = [
  {
    id: "1",
    name: "QuickLube Auto",
    address: "123 Main Street",
    distance: "0.8 mi",
    rating: 4.8,
    reviews: 245,
    hours: "Open until 7 PM",
    phone: "(555) 123-4567",
    isRecommended: true,
    specialties: ["Oil Change", "Tire Service"],
  },
  {
    id: "2",
    name: "City Auto Service",
    address: "456 Oak Avenue",
    distance: "1.2 mi",
    rating: 4.6,
    reviews: 189,
    hours: "Open until 6 PM",
    phone: "(555) 234-5678",
    isRecommended: false,
    specialties: ["Brakes", "General Repair"],
  },
  {
    id: "3",
    name: "Precision Auto Care",
    address: "789 Elm Boulevard",
    distance: "2.1 mi",
    rating: 4.9,
    reviews: 312,
    hours: "Open until 8 PM",
    phone: "(555) 345-6789",
    isRecommended: true,
    specialties: ["Full Service", "Diagnostics"],
  },
];

export function NearbyShops() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Shops
        </CardTitle>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          View Map
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {nearbyShops.map((shop) => (
            <div
              key={shop.id}
              className="rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 sm:p-4"
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-foreground">{shop.name}</h4>
                      {shop.isRecommended && (
                        <Badge className="bg-primary/20 text-primary border-0 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{shop.address}</p>
                  </div>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {shop.distance}
                  </span>
                  <span className="flex items-center gap-1 text-chart-3">
                    <Star className="h-3 w-3 fill-chart-3" />
                    {shop.rating} ({shop.reviews})
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {shop.hours}
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1">
                  {shop.specialties.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2 sm:flex-none">
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-2 sm:flex-none">
                    <ExternalLink className="h-3 w-3" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
