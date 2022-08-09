import { Injectable } from '@nestjs/common';
import { Message } from 'src/modules/database/message/message.entity';
import { LATEST_SHOUTOUTS_LIMIT } from '../constants';
import { HelperService } from '../helper.service';

@Injectable()
export class ShoutoutsService {
  constructor(private helperService: HelperService) {}

  async latestShoutouts(): Promise<Message[]> {
    const shoutouts = await this.helperService.getShoutouts();

    const latestShoutouts = await shoutouts
      .orderBy('shoutout.createDate', 'DESC')
      .limit(LATEST_SHOUTOUTS_LIMIT)
      .getMany();

    await this.helperService.mapRecipients(latestShoutouts);

    return latestShoutouts;
  }

  async shoutoutsByYear(year: string): Promise<Message[]> {
    const requestedYear = Number(year);
    let yearShoutouts;

    if (requestedYear) {
      const shoutouts = await this.helperService.getShoutouts();

      yearShoutouts = await shoutouts
        .where('EXTRACT(YEAR from shoutout.createDate) = :requestedYear', {
          requestedYear,
        })
        .getMany();
    } else {
      const now = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      const shoutouts = await this.helperService.getShoutouts();

      yearShoutouts = await shoutouts
        .where('shoutout.createDate >= :twelveMonthsAgo', { twelveMonthsAgo })
        .getMany();
    }

    await this.helperService.mapRecipients(yearShoutouts);

    return yearShoutouts;
  }
}
