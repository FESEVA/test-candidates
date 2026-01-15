import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { Candidate } from '../../candidate/candidate.entity';
import { Seniority } from '../../candidate/candidate.entity';

export const CandidateFactory = setSeederFactory(Candidate, () => {
  const candidate = new Candidate();
  candidate.name = faker.person.firstName();
  candidate.surname = faker.person.lastName();
  candidate.seniority = faker.helpers.arrayElement([
    Seniority.JUNIOR,
    Seniority.SENIOR,
  ]);
  candidate.yearsOfExperience = faker.number.int({
    min: 0,
    max: candidate.seniority === Seniority.SENIOR ? 20 : 3,
  });
  candidate.availability = faker.datatype.boolean({ probability: 0.7 });

  return candidate;
});
