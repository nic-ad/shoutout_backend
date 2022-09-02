import { ApiProperty } from '@nestjs/swagger';

import { BasicProfileDto } from '../../profile/dto/profile.dto';

class ElementsDto {
  @ApiProperty({
    description: 'Auto-generated unique/sequential id for this piece of the shoutout',
    example: '1',
  })
  id: number;

  @ApiProperty({
    description: 'Single word, name or string of text for this piece of the shoutout',
    examples: ['Shoutout to', 'Hard McWorker', 'for great work!'],
  })
  text: string;

  @ApiProperty({
    description: 'The type for this piece of the shoutout',
    examples: ['text', 'user'],
  })
  type: string;

  @ApiProperty({
    nullable: true,
    description: 'Employee id of corresponding person when element type is "user" (i.e. a name)',
    example: '1234',
  })
  employeeId: string;
}

class ChannelDto {
  @ApiProperty({ description: 'Auto-generated database id' })
  id: string;

  @ApiProperty({
    description: 'Slack id for the channel',
    example: 'C03HR04D338',
  })
  slackId: string;

  @ApiProperty({ example: 'peakon-test-channel' })
  name: string;
}

export class ShoutoutDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description:
      'Full text of the shoutout (broken down into frontend-friendly array in the "elements" property)',
    example: 'Shoutout to <@UJDNSKJDN> for great work!',
  })
  text: string;

  @ApiProperty()
  createDate: Date;

  @ApiProperty({
    description: 'Employee id of the shoutout author',
    example: '1234',
  })
  authorId: string;

  @ApiProperty({
    type: () => [BasicProfileDto],
    description: 'List of profiles for people who were shouted out',
  })
  recipients: BasicProfileDto[] | string[];

  @ApiProperty({
    type: [ElementsDto],
    description: `Array of pieces making up the shoutout allowing frontend to reconstruct the message
      (e.g. name elements are actual names instead of in slack format as seen in the "text" property)`,
  })
  elements: ElementsDto[];

  @ApiProperty({
    type: ChannelDto,
    description: 'Slack channel that the shoutout was authored in',
  })
  channel: ChannelDto;

  @ApiProperty({
    type: () => BasicProfileDto,
    description: 'Profile of the shoutout author',
  })
  author?: BasicProfileDto;
}
