import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SlackService } from 'src/slack/slack.service';

import { LATEST_SHOUTOUTS_LIMIT } from '../constants';
import { HelperService } from '../helper.service';
import { ShoutoutDto } from './dto/shoutout.dto';
import { TimeframeShoutoutsDto } from './dto/timeframe.shoutouts.dto';

@Injectable()
export class ShoutoutsService {
  constructor(
    private helperService: HelperService,
    @Inject(SlackService) private slackService: SlackService,
  ) {}

  async latestShoutouts(): Promise<ShoutoutDto[]> {
    const shoutouts: ShoutoutDto[] = await this.helperService
      .getShoutouts()
      .orderBy('shoutout.createDate', 'DESC')
      .take(LATEST_SHOUTOUTS_LIMIT)
      .getMany();

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }

  async shoutoutsByYear(year: string): Promise<ShoutoutDto[]> {
    const requestedYear = Number(year);
    let shoutouts: ShoutoutDto[];

    if (requestedYear) {
      shoutouts = await this.helperService
        .getShoutouts()
        .where('EXTRACT(YEAR from shoutout.createDate) = :requestedYear', {
          requestedYear,
        })
        .getMany();
    } else {
      const now = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      shoutouts = await this.helperService
        .getShoutouts()
        .where('shoutout.createDate >= :twelveMonthsAgo', { twelveMonthsAgo })
        .getMany();
    }

    await this.helperService.postProcessShoutouts(shoutouts);

    return shoutouts;
  }

  async shoutoutsByTimeframe(timeframeDto: TimeframeShoutoutsDto): Promise<any> {
    return this.slackService.getShoutoutsInTimeframe({ ...timeframeDto });
  }

  async insertShoutoutAtTimestamp(timestamp: string): Promise<any> {
    const response = await this.slackService.getShoutoutsInTimeframe({
      oldest: timestamp,
      latest: timestamp,
      limit: 1,
    });

    if (response.messages.length && response.messages[0].blocks) {
      return this.slackService.insertMessage({
        ...response.messages[0],
        channel: process.env.SHOUTOUT_CHANNEL_ID,
        createDate: new Date(Number(timestamp) * 1000),
      });
    }

    throw new UnprocessableEntityException('No Shoutout Found with Timestamp Provided');
  }
}
