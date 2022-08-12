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
    examples: ['Shoutout to', 'Hard McWorker', 'for great work!']
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
};

export class ShoutoutDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ 
    description: 'Full text of the shoutout (broken down into pieces in the "elements" property)', 
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
  //string[] needed to satisfy type conversion from typeorm query result type (Message, which has recipients: string[]) to 
  //API response type (ShoutoutDto with recipients: BasicProfileDto[], which is the string[] mapped into profiles) in API service functions
  recipients: BasicProfileDto[] | string[];

  @ApiProperty({ type: [ElementsDto] })
  elements: ElementsDto[];

  @ApiProperty({ 
    type: () => BasicProfileDto,
    description: 'Profile of the shoutout author', 
  })
  author?: BasicProfileDto;
}