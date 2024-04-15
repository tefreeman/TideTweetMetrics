import { inject, Injectable } from '@angular/core';
import { I_DisplayableData, I_DisplayableRequest } from '../interfaces/displayable-interface';


let test_displayed_data: I_DisplayableRequest = {
  stat_name: "tweet_likes-sum-yearly",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-trend",
}

let test_displayed_data1: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs", "msu_egr"]},
  type: "stat-comp",
}


let test_displayed_data2: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data3: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}

let test_displayed_data4: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data5: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data6: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data7: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}

let test_displayed_data8: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}

let test_displayed_data9: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data10: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}


let test_displayed_data11: I_DisplayableRequest = {
  stat_name: "tweet_likes-mean",
  ownersConfig: {type: "specific", owners: ["alabama_cs"]},
  type: "stat-value",
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  public overrideProfile = true;
  constructor() { 
  }


  getMockData(): I_DisplayableRequest[] {
    return [test_displayed_data, test_displayed_data1, test_displayed_data2, test_displayed_data3, test_displayed_data4, test_displayed_data5, test_displayed_data6, test_displayed_data7, test_displayed_data8, test_displayed_data9, test_displayed_data10, test_displayed_data11];
  }


}
