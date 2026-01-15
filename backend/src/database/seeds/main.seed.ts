import { runSeeders } from 'typeorm-extension';
import CreateCandidates from './create-candidates.seed';
import dataSource from '../../config/seeding.config';

const main = async () => {
  try {
    await dataSource.initialize();
    console.log('✓ Conectado a la base de datos');

    await runSeeders(dataSource, {
      seeds: [CreateCandidates],
      factories: ['src/database/factories/**/*.factory.ts'],
    });

    console.log('✓ Seeding completado exitosamente');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error durante el seeding:', error);
    process.exit(1);
  }
};

main();
