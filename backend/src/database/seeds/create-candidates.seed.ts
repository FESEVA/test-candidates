import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Candidate } from '../../candidate/candidate.entity';
import { Seniority } from '../../candidate/candidate.entity';

export default class CreateCandidates implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const candidateRepository = dataSource.getRepository(Candidate);

    const candidateData = {
      name: 'Fernando Iván',
      surname: 'Sevilla Valderrama',
      seniority: Seniority.SENIOR,
      yearsOfExperience: 4,
      availability: true,
    };
    const candidateExists = await candidateRepository.findOneBy({
      name: candidateData.name,
      surname: candidateData.surname,
    });

    if (!candidateExists) {
      await candidateRepository.save(candidateData);
    }

    console.log('✓ Primer candidato fijo creado');

    const candidateFactory = factoryManager.get(Candidate);
    await candidateFactory.saveMany(10);

    console.log('✓ 10 candidatos aleatorios creados');
  }
}
