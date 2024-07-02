import { Injectable, inject } from '@angular/core';
import { TweetPayload, TweetNode } from '../interfaces/optimizer-interface';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OptimizerService {
  private _functions = inject(Functions);

  findHighestPredictionNodes(root: TweetNode, n: number): TweetNode[] {
    const allNodes: TweetNode[] = [];

    const traverse = (node: TweetNode): void => {
      allNodes.push(node);
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(root);

    allNodes.sort((a, b) => b.prediction - a.prediction);

    return allNodes.slice(0, n);
  }

  /**
   *
   * @param payload
   * @returns a TweetNode representing the optimized tweet tree
   */
  getOptimizeTweet$(payload: TweetPayload): Observable<any> {
    // Create a callable function reference
    const callable = httpsCallable(this._functions, 'optimizeTweet');
    return from(callable(payload)).pipe(
      map((result) => {
        return result.data;
      }),
      catchError((error) => {
        console.error('Error calling function:', error);
        return throwError(error);
      })
    );
  }
}
