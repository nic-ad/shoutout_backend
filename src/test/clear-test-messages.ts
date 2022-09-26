import { Channel } from '../modules/database/channel/channel.entity';
import { getInitializedDataSource } from '../modules/database/database.providers';
import { Message } from '../modules/database/message/message.entity';

/**
 * Clears messages and channels from database so that test runs/table hits remain performant.
 */
const clearTestMessages = async () => {
  try {
    const dataSource = await getInitializedDataSource(
      process.env.POSTGRES_TEST_DB,
      process.env.POSTGRES_TEST_PORT,
    );
    console.log('initialized datasource retrieved for test database');

    const messageRepository = dataSource.getRepository(Message);
    const channelRepository = dataSource.getRepository(Channel);

    await messageRepository.delete({});
    await channelRepository.delete({});

    console.log('test messages cleared');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

clearTestMessages();
