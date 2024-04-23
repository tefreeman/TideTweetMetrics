import { Injectable } from '@angular/core';
import { I_KeyTranslator } from '../interfaces/key-translator-interface';

/**
 * Service responsible for translating keys used in the application.
 */
@Injectable({
  providedIn: 'root',
})
export class KeyTranslatorService {
  // TODO: ISSUE: improve the translation object to sound more natural
  /**
   * The translation object that maps keys to their corresponding translations.
   */
  private _translationObject: I_KeyTranslator = {
    mean: { full: 'Average of all', abr: 'Avg', desc: 'Mean value', order: 1 },
    std: {
      full: 'Standard Deviation of all',
      abr: 'SD',
      desc: 'Standard Deviation value',
      order: 1,
    },
    min: {
      full: 'Minimum of all',
      abr: 'Min',
      desc: 'Minimum value',
      order: 1,
    },
    max: {
      full: 'Maximum of all',
      abr: 'Max',
      desc: 'Maximum value',
      order: 1,
    },
    count: {
      full: 'Count of all',
      abr: 'count',
      desc: 'Count value',
      order: 1,
    },
    sum: {
      full: 'Sum of all',
      abr: 'Sum',
      desc: 'Sum value, order: 1',
      order: 1,
    },
    median: {
      full: 'Median of all',
      abr: 'Med',
      desc: 'Median value',
      order: 1,
    },
    '25th_percentile': {
      full: '25th Percentile of all',
      abr: '25th',
      desc: '25th Percentile value',
      order: 1,
    },
    '75th_percentile': {
      full: '75th Percentile of all',
      abr: '75th',
      desc: '75th Percentile value',
      order: 1,
    },
    pearson: {
      full: 'Pearson Correlation Coefficient of',
      abr: 'PCC',
      desc: 'Pearson Correlation Coefficient of two stats; used globally',
      order: 1,
    },
    tweet_likes: {
      full: 'likes',
      abr: 'TLike',
      desc: 'Number of Likes on a given Tweet',
      order: 2,
    },
    tweet_retweets: {
      full: 'retweets',
      abr: 'TRet',
      desc: 'Number of Retweets of a given Tweet',
      order: 2,
    },
    tweet_replies: {
      full: 'replies',
      abr: 'TRep',
      desc: 'Number of Replies on a given Tweet',
      order: 2,
    },
    tweet_quotes: {
      full: 'quotes',
      abr: 'TQuote',
      desc: 'Number of Quotes in a given Tweet',
      order: 2,
    },
    tweet_hashtags: {
      full: 'hashtags',
      abr: 'THash',
      desc: 'Number of Hashtags in a given Tweet',
      order: 2,
    },
    tweet_cashtags: {
      full: 'cashtags',
      abr: 'TCash',
      desc: 'Number of Cashtags in a given Tweet',
      order: 2,
    },
    tweet_mentions: {
      full: 'mentions',
      abr: 'TMent',
      desc: 'Number of Mentions in a given Tweet',
      order: 2,
    },
    tweet_urls: {
      full: 'URLs',
      abr: 'TUrl',
      desc: 'Number of URLs in a given Tweet',
      order: 2,
    },
    tweet_photos: {
      full: 'photos',
      abr: 'TPhoto',
      desc: 'Number of Photos in a given Tweet',
      order: 2,
    },
    tweet_videos: {
      full: 'videos',
      abr: 'TVid',
      desc: 'Number of Videos in a given Tweet',
      order: 2,
    },
    tweet_cards: {
      full: 'cards',
      abr: 'TCard',
      desc: 'Number of Cards in a given Tweet',
      order: 2,
    },
    tweet_referenced_tweets: {
      full: 'Referenced Tweets',
      abr: 'TRT',
      desc: 'Number of Referenced Tweets in a given Tweet',
      order: 2,
    },
    tweet_count: {
      full: 'tweet counts',
      abr: 'TCount',
      desc: "Number of 'counts' in a given Tweet",
      order: 2,
    },
    tweet_chars: {
      full: 'characters',
      abr: 'TChar',
      desc: 'Number of characters in a given Tweet',
      order: 2,
    },
    tweet_words: {
      full: 'words',
      abr: 'TWord',
      desc: 'Number of words in a given Tweet',
      order: 2,
    },
    tweet_annotations: {
      full: 'annotations',
      abr: 'TAnn',
      desc: 'Number of annotations in a given Tweet',
      order: 2,
    },
    post_date_day: {
      full: 'post Date values',
      abr: 'PDt',
      desc: 'What day of the week the Tweet was posted (0=Mon, 1=Tues... 6=Sun)',
      order: 2,
    },
    post_date_hour: {
      full: 'post Hour values',
      abr: 'PHr',
      desc: 'What hour of the day the Tweet was posted (0=12am, 1=1am... 23=11pm)',
      order: 2,
    },
    likes_per_follower: {
      full: 'Total Likes per Follower ratio',
      abr: 'LPF',
      desc: 'Sum of Tweet Likes divided by Total followers, for a given profile',
      order: 1,
    },
  };

  /**
   * The translation fixes object that contains fixes for specific keys.
   */
  private _translationFixes: I_KeyTranslator = {
    'tweet_count-sum-remove': {
      full: 'Tweet Count',
      abr: 'TC',
      desc: 'Tweet Count value',
      order: 1,
    },
  };

  constructor() {}

  /**
   * Sets the translation object.
   * @param translationObject - The translation object to set.
   */
  public setTranslationObject(translationObject: I_KeyTranslator): void {
    this._translationObject = translationObject;
  }

  /**
   * Splits a key into an array of parts.
   * @param key - The key to split.
   * @returns An array of parts.
   */
  splitKey(key: string): string[] {
    return key.split('-');
  }

  /**
   * Translates a single key to its full string representation.
   * @param key - The key to translate.
   * @returns The full string representation of the key.
   */
  private translateKeySingle(key: string): string {
    return this._translationObject[key]?.full ?? key;
  }

  /**
   * Converts a key to its full string representation.
   * @param key - The key to convert.
   * @returns The full string representation of the key.
   */
  keyToFullString(key: string): string {
    if (this._translationFixes[key]) {
      return this._translationFixes[key].full;
    }

    let keys = this.splitKey(key);
    keys.sort(
      (a, b) =>
        this._translationObject[a]?.order - this._translationObject[b]?.order
    );
    return keys.map((k) => this.translateKeySingle(k)).join(' ');
  }

  /**
   * Converts a key to its full string representation and returns the parts as an array.
   * @param key - The key to convert.
   * @param reverseOrder - Whether to reverse the order of the parts.
   * @returns An array of parts representing the full string representation of the key.
   */
  keyToFullStringParts(key: string, reverseOrder = false): string[] {
    if (this._translationFixes[key]) {
      return this._translationFixes[key].full.split(' ');
    }

    let keys = this.splitKey(key);

    keys.sort(
      (a, b) =>
        this._translationObject[a]?.order - this._translationObject[b]?.order
    );

    if (reverseOrder) {
      keys.reverse();
    }
    return keys.map((k) => this.translateKeySingle(k));
  }

  /**
   * Checks if a key has an abbreviation.
   * @param key - The key to check.
   * @returns True if the key has an abbreviation, false otherwise.
   */
  hasAbr(key: string): boolean {
    return !!this._translationObject[key]?.abr;
  }

  /**
   * Checks if a key has a description.
   * @param key - The key to check.
   * @returns True if the key has a description, false otherwise.
   */
  hasDesc(key: string): boolean {
    return !!this._translationObject[key]?.desc;
  }
  /**
   * Reverses a full string translation back to the original key(s).
   * @param fullString - The full string representation to reverse-translate.
   * @returns The original key or keys concatenated by '-' if the full string represents multiple keys.
   */

  // this is a terrible way to do this but 4am time crunch
  reverseTranslate(fullString: string): string {
    // Extract all 'full' values and their corresponding keys and orders.
    const fullMatches: { key: string; order: number }[] = [];
    Object.entries(this._translationObject).forEach(
      ([key, { full, order }]) => {
        if (fullString.includes(full)) {
          // Check if the full part is in the given string
          fullMatches.push({ key, order });
        }
      }
    );

    // Sort the matches based on the 'order' value.
    fullMatches.sort((a, b) => b.order - a.order);

    // Extract the keys and concatenate them.
    const result = fullMatches.map((match) => match.key).join('-');

    return result;
  }

  /**
   * Translates a key to its abbreviation.
   * @param key - The key to translate.
   * @returns The abbreviation of the key.
   */
  translateKeyAbr(key: string): string {
    return this._translationObject[key]?.abr ?? key;
  }

  /**
   * Translates a key to its description.
   * @param key - The key to translate.
   * @returns The description of the key.
   */
  translateKeyDesc(key: string): string {
    return this._translationObject[key]?.desc ?? key;
  }
}
