import { NextResponse } from "next/server"

type GeocodeResponse = {
  results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>
  status?: string
  error_message?: string
}

type PlacesTextSearchResponse = {
  results?: Array<{
    place_id: string
    name: string
    formatted_address?: string
    geometry?: { location?: { lat: number; lng: number } }
    rating?: number
    user_ratings_total?: number
  }>
  status?: string
  error_message?: string
}

function getApiKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = (searchParams.get("zip") || "").trim()

  if (!zip) {
    return NextResponse.json({ error: "ZIP is required." }, { status: 400 })
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing GOOGLE_MAPS_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).",
      },
      { status: 500 }
    )
  }

  try {
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      zip
    )}&key=${apiKey}`
    const geoRes = await fetch(geoUrl, { cache: "no-store" })

    if (!geoRes.ok) {
      return NextResponse.json(
        { error: "Geocode lookup failed." },
        { status: 502 }
      )
    }

    const geoJson = (await geoRes.json()) as GeocodeResponse

    if (
      geoJson.status &&
      geoJson.status !== "OK" &&
      geoJson.status !== "ZERO_RESULTS"
    ) {
      const msg =
        geoJson.error_message || `Geocoding API error: ${geoJson.status}`
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const loc = geoJson.results?.[0]?.geometry?.location

    if (!loc) {
      return NextResponse.json(
        { error: "Could not find location for that ZIP." },
        { status: 404 }
      )
    }

    const query = `auto repair mechanic tire shop oil change near ${zip}`
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&location=${loc.lat},${loc.lng}&radius=8000&key=${apiKey}`

    const placesRes = await fetch(placesUrl, { cache: "no-store" })
    if (!placesRes.ok) {
      return NextResponse.json(
        { error: "Places lookup failed." },
        { status: 502 }
      )
    }

    const placesJson = (await placesRes.json()) as PlacesTextSearchResponse

    if (
      placesJson.status &&
      placesJson.status !== "OK" &&
      placesJson.status !== "ZERO_RESULTS"
    ) {
      const msg =
        placesJson.error_message || `Places API error: ${placesJson.status}`
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const results = (placesJson.results || []).slice(0, 12)

    return NextResponse.json({
      center: loc,
      results,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch nearby shops." },
      { status: 500 }
    )
  }
}
