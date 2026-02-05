export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

export type VehicleBrand = {
  id: number;
  name: string;
};

export type VehicleModel = {
  id: number;
  name: string;
  variant: string;
  startYear: number;
  endYear: number;
};

export type RegisterMyCarRequest = {
  modelId: number;
  registrationNumber: string;
  mileage: number;
};

export type MyCar = {
  id: number;
  brandName: string;
  modelName: string;
  variant: string;
  startYear: number;
  endYear: number;
  registrationNumber: string;
  mileage: number;
};

