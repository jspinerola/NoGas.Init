import * as z from "zod"

export const carSchema = z.object({
  carId: z
    .number()
    .optional(),
  year: z
    .number()
    .min(1, "Car year must be specified"),
  make: z
    .string()
    .min(1, "Make must be specified"),
  model: z
    .string()
    .min(1, "Model must be specified"),
  vinPrefix: z
    .string()
    .min(1, "VIN must be specified")
    .max(18, "Max characters: 17"),
  manualPdfUrl: z
    .url({
        protocol: /^https$/,
        message: "A valid HTTPS link is required"
    })
    .optional(),
  licensePlate: z
    .string()
    .min(1, "Provide a valid license plate"),
  name: z
    .string()
    .min(1, "Give a valid name to your vehicle"),
  miles: z
    .number()
    .min(1, "Current odometer must be specified"),
  nextService: z
    .string()
    .optional(),
  mpg: z
    .number()
    .optional(), 
  isDefault: z.boolean()
    
})