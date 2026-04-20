import * as z from "zod"


export const serviceSchema = z.object({
  id: z
    .number(),
  carId: z
    .number(),
  taskId: z
    .number(),
  taskName: z 
    .string()
    .min(1, "Please specify a name that describes this service"),
  completedDate: z
    .coerce.date(),
  odometerService: z
    .number()
    .min(1, "Please provide the car's odometer at service"),
  cost: z
    .number()
    .min(1, "Please provide the cost of the service"),
  receiptUrl: z
      .url({
          protocol: /^https$/,
          message: "A valid HTTPS link is required"
      }),
})