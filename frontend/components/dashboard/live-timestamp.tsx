"use client"

import { useEffect, useState } from "react"

export function LiveTimestamp() {
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    setTimestamp(new Date().toLocaleString())
  }, [])

  if (!timestamp) return null
  return <span>Last Updated: {timestamp}</span>
}
