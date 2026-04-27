export interface Vehicle {
  id: number;
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