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

import { carSchema } from "@/components/forms/schemas/car.schema";
import z from "zod";

const formSchema = z.object({
  car: carSchema,
});

export type CarValues = z.infer<typeof formSchema>;

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  miles: number;
  licensePlate: string;
  vinPrefix: string;
  isDefault: boolean;
  mpg: number;
  nextService: Date;
}


interface AddVehicleDialogProps {
  onAddVehicle: (vehicle: Vehicle) => void;
}



export function AddVehicle({ onAddVehicle }: AddVehicleDialogProps) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const methods = useForm<CarValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      car: {
        name: "",
        make: "",
        model: "",
        year: 0,
        miles: 0,
        licensePlate: "",
        vinPrefix: "",
        nextService: "",
        isDefault: false,
        mpg: 0,
      },
    },
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = methods;

  const onError = (errors: any) => {
    console.log("VALIDATION FAILED:", errors);
  };

  const onSubmit = (data: CarValues) => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      name: data.car.name,
      make: data.car.make,
      model: data.car.model,
      year: data.car.year,
      miles: data.car.miles,
      licensePlate: data.car.licensePlate,
      vinPrefix: data.car.vinPrefix || "",
      mpg: data.car.mpg ?? 0,
      nextService: data.car.nextService
        ? new Date(data.car.nextService)
        : new Date(),
      isDefault: data.car.isDefault,
    };

    onAddVehicle(newVehicle);

    console.log("New vehicle added:", JSON.stringify(newVehicle, null, 2));

    reset();
    dialogCloseRef.current?.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="secondary">
          <Plus className="mr-1" />
          Add a Car
        </Button>
      </DialogTrigger>

      <FormProvider {...methods}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <DialogHeader>
              <DialogTitle>Add a Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details of your vehicle. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Controller
                  name="car.name"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input placeholder="e.g., Bob" {...field} />
                      {isSubmitted && errors.car?.name && (
                        <FieldError errors={[errors.car.name]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Make</FieldLabel>
                <Controller
                  name="car.make"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input placeholder="e.g., Nissan" {...field} />
                      {isSubmitted && errors.car?.make && (
                        <FieldError errors={[errors.car.make]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Model</FieldLabel>
                <Controller
                  name="car.model"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input placeholder="e.g., Kicks" {...field} />
                      {isSubmitted && errors.car?.model && (
                        <FieldError errors={[errors.car.model]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Year</FieldLabel>
                <Controller
                  name="car.year"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        type="number"
                        placeholder="2023"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                      {isSubmitted && errors.car?.year && (
                        <FieldError errors={[errors.car.year]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>Miles</FieldLabel>
                <Controller
                  name="car.miles"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        type="number"
                        placeholder="45678"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                      {isSubmitted && errors.car?.miles && (
                        <FieldError errors={[errors.car.miles]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>License Plate</FieldLabel>
                <Controller
                  name="car.licensePlate"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input placeholder="ABC 1234" {...field} />
                      {isSubmitted && errors.car?.licensePlate && (
                        <FieldError errors={[errors.car.licensePlate]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>VIN</FieldLabel>
                <Controller
                  name="car.vinPrefix"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input placeholder="1HGBH41JXMN109186" {...field} />
                      {isSubmitted && errors.car?.vinPrefix && (
                        <FieldError errors={[errors.car.vinPrefix]} />
                      )}
                    </>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel>MPG</FieldLabel>
                <Controller
                  name="car.mpg"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="28.5"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                      {isSubmitted && errors.car?.mpg && (
                        <FieldError errors={[errors.car.mpg]} />
                      )}
                    </>
                  )}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button ref={dialogCloseRef} variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">Add Vehicle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
}