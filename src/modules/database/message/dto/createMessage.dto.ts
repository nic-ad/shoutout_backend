import { Channel } from '../../channel/channel.entity';
import { Elements } from '../../elements/elements.entity';

export class CreateMessageDto {
  authorId: string;
  channel: Channel;
  elements: Elements[];
  recipients: string[];
  text: string;
  createDate?: Date;
}

export default CreateMessageDto;
