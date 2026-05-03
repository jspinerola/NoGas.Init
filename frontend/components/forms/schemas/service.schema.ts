import * as z from "zod"


export const serviceSchema = z.object({
  id: z
    .number()
    .optional(),
  carId: z
    .string()
    .min(1, "Please select a vehicle"),
  taskId: z
    .string() 
    .optional(),
  taskName: z 
    .string()
    .min(1, "Please specify a name that describes this service"),
  completedDate: z
    .date(),
  odometerService: z
    .number()
    .min(1, "Please provide the car's odometer at service"),
  cost: z
    .number()
    .min(1, "Please provide the cost of the service"),
})