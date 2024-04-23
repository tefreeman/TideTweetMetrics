import { Injectable } from '@angular/core';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { I_PageMap } from '../interfaces/pages-interface';

let test_displayed_data1: I_DisplayableRequest = {
  stat_name: 'tweet_likes-sum',
  ownersParams: { type: 'specific', owners: ['alabama_cs'] },
  type: 'stat-value',
};
let test_displayed_data2: I_DisplayableRequest = {
  stat_name: 'tweet_likes-mean-yearly',
  ownersParams: { type: 'specific', owners: ['alabama_cs'] },
  type: 'stat-trend',
};
let test_displayed_data3: I_DisplayableRequest = {
  stat_name: 'tweet_retweets-median',
  ownersParams: { type: 'specific', owners: ['alabama_cs', '_global'] },
  type: 'stat-comp',
};
let test_displayed_data4: I_DisplayableRequest = {
  stat_name: 'tweet_likes-mean',
  ownersParams: {
    type: 'specific',
    count: 2,
    owners: ['alabama_cs', 'azengineering'],
  },
  groupId: 'test',
  type: 'auto',
};

let test_displayed_data5: I_DisplayableRequest = {
  stat_name: 'tweet_likes-median',
  ownersParams: {
    type: 'specific',
    count: 2,
    owners: ['alabama_cs', 'azengineering'],
  },
  groupId: 'test',
  type: 'auto',
};

let test_displayed_data12: I_DisplayableRequest = {
  stat_name: 'tweet_likes-mean',
  ownersParams: { type: 'bottom', owners: ['alabama_cs'], count: 12 },
  type: 'graph-line',
};

let test_displayed_data13: I_DisplayableRequest = {
  stat_name: 'tweet_likes-mean',
  ownersParams: { type: 'top', owners: ['alabama_cs'], count: 20 },
  type: 'auto',
};

let test_displayed_data14: I_DisplayableRequest = {
  stat_name: 'tweet_likes-mean',
  ownersParams: { type: 'all', owners: ['alabama_cs'], count: 100 },
  type: 'graph-line',
};

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  /**
   * Determines whether to override the profile or not.
   */
  public overrideProfile = true;

  constructor() {}

  /**
   * Retrieves mock data.
   * @returns The mock data.
   */
  getMockData(): I_PageMap {
    return {
      home: {
        'Graph Grid': {
          displayables: [test_displayed_data5, test_displayed_data4],
          type: 'graph',
          order: 2,
        },

        'Card Grid': {
          displayables: [
            test_displayed_data1,
            test_displayed_data2,
            test_displayed_data3,
          ],
          type: 'stat',
          order: 1,
        },
        // Add more mock data as needed for your use case
      },
    };
  }
}
