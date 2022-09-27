/**
 * Runs initialization functionality needed before tests
 */

import { getInitializedDataSource } from '../modules/database/database.providers';

async function initTestDatabase() {
  try {
    const dataSource = await getInitializedDataSource(
      process.env.POSTGRES_TEST_DB,
      process.env.POSTGRES_TEST_PORT,
    );

    await dataSource.synchronize();
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

initTestDatabase();
