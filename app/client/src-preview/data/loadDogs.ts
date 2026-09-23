import type { AdoptionStatus, Dog } from '../../src/types/dog';
import rawDogs from './dogs.json';

const isAdoptionStatus = (status: string): status is AdoptionStatus =>
  status === 'AVAILABLE' || status === 'PENDING' || status === 'ADOPTED';

export const dogs: Dog[] = rawDogs.map((dog) => {
  if (!isAdoptionStatus(dog.status)) {
    throw new Error(`Unsupported adoption status for dog ${dog.id}: ${dog.status}`);
  }

  return {
    ...dog,
    status: dog.status,
  };
});
