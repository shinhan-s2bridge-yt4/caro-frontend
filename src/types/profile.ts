export interface PrimaryCar {
  id: number;
  brandName: string;
  modelName: string;
  variant: string;
  registrationNumber: string;
}

export interface ProfileData {
  name: string;
  email: string;
  primaryCar: PrimaryCar | null;
}

export interface ProfileResponse {
  code: string;
  message: string;
  data: ProfileData;
}
