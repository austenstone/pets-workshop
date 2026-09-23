export type AdoptionStatus = 'AVAILABLE' | 'PENDING' | 'ADOPTED';

export interface DogSummary {
  id: number;
  name: string;
  breed: string;
}

export interface Dog extends DogSummary {
  age: number;
  description: string;
  gender: string;
  status: AdoptionStatus;
}
