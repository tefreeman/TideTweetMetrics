import { Injectable } from '@angular/core';
import { I_DisplayableRequest } from '../interfaces/displayable-interface';
import { I_PageMap } from '../interfaces/pages-interface';

let test_displayed_data1: I_DisplayableRequest = {
  metricNames: ['tweet_likes-sum'],
  ownersParams: { type: 'specific', owners: ['alabama_cs'] },
  type: 'metric-value',
};
let test_displayed_data2: I_DisplayableRequest = {
  metricNames: ['tweet_likes-mean-yearly'],
  ownersParams: { type: 'specific', owners: ['alabama_cs'] },
  type: 'metric-trend',
};
let test_displayed_data3: I_DisplayableRequest = {
  metricNames: ['tweet_retweets-median'],
  ownersParams: { type: 'specific', owners: ['alabama_cs', '_global'] },
  type: 'metric-comp',
};

let test_displayed_data4: I_DisplayableRequest = {
  metricNames: ['tweet_likes-mean-yearly'],
  ownersParams: { type: 'top', owners: ['alabama_cs', '_global'], count: 3 },
  type: 'auto-graph',
};

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  /**
   * Determines whether to override the profile or not.
   */
  public overrideProfile = false;

  constructor() {}

  /**
   * Retrieves mock data.
   * @returns The mock data.
   */
  getMockData(): I_PageMap {
    return {
      home: {
        'graph grid': {
          displayables: [test_displayed_data4],
          type: 'graph',
          order: 2,
        },

        'card grid': {
          displayables: [
            test_displayed_data1,
            test_displayed_data2,
            test_displayed_data3,
          ],
          type: 'metric',
          order: 1,
        },
        // Add more mock data as needed for your use case
      },
    };
  }
}
