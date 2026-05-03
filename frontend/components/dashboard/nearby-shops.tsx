"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Star, Phone, ExternalLink, X, SearchX } from "lucide-react"
import { useEffect, useState } from "react"

type PlacesResult = {
  place_id: string
  name: string
  formatted_address?: string
  geometry?: { location: { lat: number; lng: number } }
  rating?: number
  user_ratings_total?: number
}

function formatDistanceFrom(
  centerLat: number,
  centerLng: number,
  lat: number,
  lng: number
) {
  const R = 6371 // km
  const toRad = (v: number) => (v * Math.PI) / 180
  const dLat = toRad(lat - centerLat)
  const dLon = toRad(lng - centerLng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(centerLat)) *
      Math.cos(toRad(lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  if (d < 1) return `${Math.round(d * 1000)} m`
  return `${d.toFixed(1)} km`
}

export function NearbyShops() {
  const [zip, setZip] = useState("")
  const [results, setResults] = useState<PlacesResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapQuery, setMapQuery] = useState("")
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  )

  useEffect(() => {
    if (!mapOpen) return
    // keep map query up to date
    if (!mapQuery && zip) setMapQuery(`${zip} USA`)
  }, [mapOpen, zip, mapQuery])

  async function handleSearch() {
    setError(null)
    setHasSearched(true)
    if (!zip) {
      setError("Enter a ZIP code to search.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/api/nearby-shops?zip=${encodeURIComponent(zip)}`
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || "Failed to fetch nearby shops.")
        setResults([])
        return
      }

      setCenter(data.center ?? null)
      setResults((data.results ?? []) as PlacesResult[])
      setMapQuery(`${zip}`)
      setMapOpen(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch nearby shops."
      setError(message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Nearby Shops</CardTitle>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            placeholder="Enter ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full sm:w-48"
          />
          <Button size="sm" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMapOpen((v) => !v)}
          >
            {mapOpen ? (
              <div className="flex items-center gap-2">
                <X className="h-4 w-4" /> Close Map
              </div>
            ) : (
              "Map"
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && <p className="text-destructive">{error}</p>}

        {mapOpen && (
          <div className="mb-4 w-full overflow-hidden rounded-md border">
            <iframe
              title="Nearby shops map"
              className="h-64 w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                `car repair near ${mapQuery || zip}`
              )}&output=embed`}
            />
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {loading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="animate-pulse rounded-lg border border-border bg-secondary/40 p-3 sm:p-4"
              >
                <div className="space-y-3">
                  <div className="h-4 w-2/5 rounded bg-muted" />
                  <div className="h-3 w-3/5 rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 rounded bg-muted" />
                    <div className="h-8 w-28 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}

          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">
                No nearby shops found for {zip}.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another ZIP or remove spaces for better matching.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <ScrollArea className="h-112 pr-3 sm:h-128">
              <div className="space-y-3 sm:space-y-4">
                {results.map((r) => (
                  <div
                    key={r.place_id}
                    className="rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:border-primary/50 sm:p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              {r.name}
                            </h4>
                            <Badge className="border-0 bg-primary/20 text-xs text-primary">
                              Auto
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {r.formatted_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                        {center && r.geometry?.location ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {formatDistanceFrom(
                              center.lat,
                              center.lng,
                              r.geometry.location.lat,
                              r.geometry.location.lng
                            )}
                          </span>
                        ) : null}

                        {r.rating ? (
                          <span className="flex items-center gap-1 text-chart-3">
                            <Star className="h-3 w-3 fill-chart-3" />
                            {r.rating} ({r.user_ratings_total ?? 0})
                          </span>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 sm:flex-none"
                          asChild
                        >
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(r.name + " " + (r.formatted_address || ""))}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Phone className="h-3 w-3" />
                            Contact
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 sm:flex-none"
                          asChild
                        >
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.formatted_address || r.name)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
