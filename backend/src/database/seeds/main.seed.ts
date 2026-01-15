import { runSeeders } from 'typeorm-extension';
import CreateCandidates from './create-candidates.seed';
import dataSource from '../../config/seeding.config';

const main = async () => {
  try {
    await dataSource.initialize();
    console.log('✓ Database connected');

    await runSeeders(dataSource, {
      seeds: [CreateCandidates],
      factories: ['src/database/factories/**/*.factory.ts'],
    });

    console.log('✓ Seeding completed successfully');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during seeding:', error);
    process.exit(1);
  }
};

main();
