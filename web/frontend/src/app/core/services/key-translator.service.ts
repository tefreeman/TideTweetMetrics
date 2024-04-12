import { Injectable } from '@angular/core';
import { I_KeyTranslator } from '../interfaces/key-translator-interface';

@Injectable({
  providedIn: 'root'
})
export class KeyTranslatorService {

  private _translationObject: I_KeyTranslator = {
    "mean": {full: "Mean", abr: "M", desc: "Mean value"},
    "std": {full: "Standard Deviation", abr: "SD", desc: "Standard Deviation value"},
    "min": {full: "Minimum", abr: "Min", desc: "Minimum value"},
    "max": {full: "Maximum", abr: "Max", desc: "Maximum value"},
    "count": {full: "Count", abr: "C", desc: "Count value"},
    "sum": {full: "Sum", abr: "S", desc: "Sum value"},
    "median": {full: "Median", abr: "Med", desc: "Median value"},
    "25th_percentile": {full: "25th Percentile", abr: "25th", desc: "25th Percentile value"},
    "75th_percentile": {full: "75th Percentile", abr: "75th", desc: "75th Percentile value"},
    "PCC": {full: "Pearson Correlation Coefficient", abr: "PCC", desc: "Pearson Correlation Coefficient value"},
    "tweet_likes": {full: "Tweet Likes", abr: "TL", desc: "Tweet Likes value"},
    "tweet_retweets": {full: "Tweet Retweets", abr: "TR", desc: "Tweet Retweets value"},
    "tweet_replies": {full: "Tweet Replies", abr: "TRe", desc: "Tweet Replies value"},
    "tweet_quotes": {full: "Tweet Quotes", abr: "TQ", desc: "Tweet Quotes value"},
    "tweet_hashtags": {full: "Tweet Hashtags", abr: "TH", desc: "Tweet Hashtags value"},
    "tweet_cashtags": {full: "Tweet Cashtags", abr: "TC", desc: "Tweet Cashtags value"},
    "tweet_mentions": {full: "Tweet Mentions", abr: "TM", desc: "Tweet Mentions value"},
    "tweet_urls": {full: "Tweet URLs", abr: "TU", desc: "Tweet URLs value"},
    "tweet_photos": {full: "Tweet Photos", abr: "TP", desc: "Tweet Photos value"},
    "tweet_videos": {full: "Tweet Videos", abr: "TV", desc: "Tweet Videos value"},
    "tweet_cards": {full: "Tweet Cards", abr: "TC", desc: "Tweet Cards value"},
    "tweet_referenced_tweets": {full: "Tweet Referenced Tweets", abr: "TRT", desc: "Tweet Referenced Tweets value"},
    "tweet_count": {full: "Tweet Count", abr: "TC", desc: "Tweet Count value"},
    "tweet_chars": {full: "Tweet Characters", abr: "TC", desc: "Tweet Characters value"},
    "tweet_words": {full: "Tweet Words", abr: "TW", desc: "Tweet Words value"},
    "tweet_annotations": {full: "Tweet Annotations", abr: "TA", desc: "Tweet Annotations value"},
    
  };

  private _translationFixes: I_KeyTranslator = {
    "tweet_count-sum": {full: "Tweet Count", abr: "TC", desc: "Tweet Count value"},
  }

  constructor() {}

  public setTranslationObject(translationObject: I_KeyTranslator): void {
      this._translationObject = translationObject;
  }

    splitKey(key: string): string[] {
        return key.split("-");
    }

  private translateKeySingle(key: string): string {
    return this._translationObject[key]?.full ?? key;
  }

  translateKey(key: string): string {
    if (this._translationFixes[key]) {
        return this._translationFixes[key].full;
    }
    
    const keys = this.splitKey(key);
    return keys.map(k => this.translateKeySingle(k)).join(" ");
  }

  hasAbr(key: string): boolean {
      return !!this._translationObject[key]?.abr;
  }

  hasDesc(key: string): boolean {
      return !!this._translationObject[key]?.desc;
  }

  translateKeyAbr(key: string): string {
      return this._translationObject[key]?.abr ?? key;
  }

  translateKeyDesc(key: string): string {
      return this._translationObject[key]?.desc ?? key;
  }

}
