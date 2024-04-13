import { inject, Injectable } from '@angular/core';
import { I_DisplayableData } from '../interfaces/displayable-interface';


let test_displayed_data: I_DisplayableData = {
  stat_name: "tweet_likes-mean",
  owners: ["alabama_cs"],
  type: "stat-value",
  values: [1]

}

let test_displayed_data2: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-value",
  values: [10]
}

let test_displayed_data3: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-trend",
  values: [10]
}

let test_displayed_data4: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-value",
  values: [10]
}

let test_displayed_data5: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-trend",
  values: [10]
}

let test_displayed_data6: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-comp",
  values: [10]
}

let test_displayed_data7: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "graph-line",
  values: [10]
}

let test_displayed_data8: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "graph-bar",
  values: [10]
}
let test_displayed_data9: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "stat-comp",
  values: [10]
}

let test_displayed_data10: I_DisplayableData = {
  stat_name: "tweet_likes-sum",
  owners: ["alabama_cs"],
  type: "graph-bar",
  values: [10]
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public overrideProfile = true;
  constructor() { 
  }


  getMockData(): I_DisplayableData[] {
    return [test_displayed_data, test_displayed_data2, test_displayed_data3, test_displayed_data4, test_displayed_data5, test_displayed_data6, test_displayed_data7, test_displayed_data8, test_displayed_data9, test_displayed_data10];
  }


}
