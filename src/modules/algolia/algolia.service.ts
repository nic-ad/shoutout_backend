import { Injectable } from '@nestjs/common';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';

import { modifyProfileData } from './helpers';

@Injectable()
export class AlgoliaService {
  private client: SearchClient;
  private userIndex: SearchIndex;

  constructor() {
    this.client = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_API_KEY);
    this.userIndex = this.client.initIndex(process.env.ALGOLIA_INDEX_NAME);
  }

  async indexUser(user: Record<string, unknown>) {
    console.log('Create User Record');
    return this.userIndex.saveObject({
      objectID: user.employeeId,
      ...user,
    });
  }

  async updateUser(partialUser: Record<string, unknown>) {
    console.log('Update User Record');

    return this.userIndex.partialUpdateObject({
      objectID: partialUser.employeeId,
      ...partialUser,
    });
  }

  async getUser(id: string): Promise<Response> {
    return this.userIndex.getObject(id);
  }

  async modifyIndex(user: any) {
    const modifiedUser = modifyProfileData(user);

    try {
      const res = await this.getUser(user.employeeId as string);

      if (!res) {
        throw new Error('Something went wrong');
      }

      return await this.updateUser(modifiedUser);
    } catch (error) {
      if (error.status === 404) {
        try {
          return await this.indexUser(modifiedUser);
        } catch (error) {
          return error;
        }
      }
    }
  }
}
