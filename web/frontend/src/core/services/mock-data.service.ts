import { inject, Injectable } from '@angular/core';
import { IDisplayableStats, I_DisplayableRequest, I_DisplayableRequestMap } from '../interfaces/displayable-interface';




let test_displayed_data: I_DisplayableRequest = {
  stat_name: "tweet_likes-median",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data1: I_DisplayableRequest = {
  stat_name: "tweet_likes-max",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data2: I_DisplayableRequest = {
  stat_name: "tweet_likes-std",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data3: I_DisplayableRequest = {
  stat_name: "tweet_retweets-mean",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data4: I_DisplayableRequest = {
  stat_name: "tweet_retweets-max",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data5: I_DisplayableRequest = {
  stat_name: "tweet_likes-sum-yearly",
  ownersConfig: { type: "specific", owners: ["alabama_cs"] },
  type: "stat-trend",
}
let test_displayed_data6: I_DisplayableRequest = {
  stat_name: "tweet_replies-mean",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data7: I_DisplayableRequest = {
  stat_name: "tweet_replies-max",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data8: I_DisplayableRequest = {
  stat_name: "likes_per_follower",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}
let test_displayed_data9: I_DisplayableRequest = {
  stat_name: "tweet_words-median",
  ownersConfig: { type: "specific", owners: ["alabama_cs", "eecs_utk"] },
  type: "stat-comp",
}



// let test_displayed_data4: I_DisplayableRequest = {
//   stat_name: "tweet_likes-mean",
//   ownersConfig: { type: "specific", owners: ["alabama_cs", "msu_egr"] },
//   type: "graph-line",
// }




let test_displayed_data11: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: { type: "bottom", owners: ["alabama_cs"], count: 12 },
  type: "graph-bar",
}


let test_displayed_data12: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: { type: "bottom", owners: ["alabama_cs"], count: 12 },
  type: "graph-line",
}

let test_displayed_data13: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: { type: "all", owners: ["alabama_cs"], count: 100 },
  type: "graph-bar",
}


let test_displayed_data14: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: { type: "all", owners: ["alabama_cs"], count: 100 },
  type: "graph-line",
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public overrideProfile = true;
  constructor() {
  }


  getMockData(): I_DisplayableRequestMap {
    return {
      "home": {
        "dashboard-graph": {
          displayables: [
            test_displayed_data14,
            test_displayed_data13,
            test_displayed_data12
          ],
          type: 'graph'
        },

        "dashboard-card": {
          displayables: [
            test_displayed_data,
            test_displayed_data1,
            test_displayed_data2,
            test_displayed_data3,
            test_displayed_data4,
            test_displayed_data5,
            test_displayed_data6,
            test_displayed_data7,
            test_displayed_data8,
            test_displayed_data9,
          ],
          type: 'stat'
        },
        // Add more mock data as needed for your use case
      }
    }

  }
}
