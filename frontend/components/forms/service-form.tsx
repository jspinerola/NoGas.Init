"use client";

import { useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

import { serviceSchema } from "@/components/forms/schemas/service.schema";
import z from "zod";
import { Service } from "@/app/types/service";
import { Vehicle } from "@/app/types/vehicle";


const formSchema = z.object({
  service: serviceSchema,
});

export type ServiceValues = z.infer<typeof formSchema>;

interface AddServiceDialogProps {
    vehicles: Vehicle[];
    onAddService: (service: Service) => void;
}

export function AddService({ vehicles, onAddService }: AddServiceDialogProps) {
  const methods = useForm<ServiceValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: {
        id: 0,
        taskName: "",
        completedDate: new Date(),
        odometerService: 0,
        cost: 0,
        carId: "",
        taskId: "",
      },
    },
    mode: "onChange",
    reValidateMode: "onSubmit"
  });

  const { control, handleSubmit, reset } = methods;

  const onSubmit = (data: ServiceValues) => {
    const newService: Service = {
      id: Date.now(), 
      carId: data.service.carId,
      taskId: data.service.taskId ?? "",
      taskName: data.service.taskName,
      completedDate: data.service.completedDate,
      odometerService: data.service.odometerService,
      cost: data.service.cost,
    };

    onAddService(newService);
    reset(); 
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>
            Enter your maintenance details
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>

              {/* Task Name */}
              <Field>
                <FieldLabel>Task Name</FieldLabel>
                <Controller
                  name="service.taskName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="Oil Change" />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>

              {/* Odometer */}
              <Field>
                <FieldLabel>Odometer</FieldLabel>
                <Controller
                  name="service.odometerService"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>

              {/* Cost */}
              <Field>
                <FieldLabel>Cost</FieldLabel>
                <Controller
                  name="service.cost"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </Field>

              {/* Date */}
              <Field>
                <FieldLabel>Date</FieldLabel>
                <Controller
                  name="service.completedDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      onChange={(e) =>
                        field.onChange(new Date(e.target.value))
                      }
                    />
                  )}
                />
              </Field>
              <Field>
                <FieldLabel>Vehicle</FieldLabel>
                <Controller
                    name="service.carId"
                    control={control}
                    render={({ field, fieldState }) => (
                    <>
                        <select
                        {...field}
                        className="w-full border rounded p-2"
                        >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={String(v.id)}>
                            {v.name} — {v.year} {v.make} {v.model}
                            </option>
                        ))}
                        </select>

                        {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                        )}
                    </>
                    )}
                />
                </Field>

            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Save</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

