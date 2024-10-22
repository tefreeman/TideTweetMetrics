import { Injectable, inject } from '@angular/core';
import { TweetPayload, TweetNode } from '../interfaces/optimizer-interface';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OptimizerService {
  private _functions = inject(Functions);

  findHighestPredictionNodes(root: TweetNode, n?: number): TweetNode[] {
    const allNodes: TweetNode[] = [];
    const uniqueTextSet: Set<string> = new Set();

    const traverse = (node: TweetNode): void => {
      if (!uniqueTextSet.has(node.text)) {
        uniqueTextSet.add(node.text);
        allNodes.push(node);
      }
      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(root);

    allNodes.sort((a, b) => b.prediction - a.prediction);

    if (n === undefined) {
      return allNodes;
    }

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

  /**
   * Finds and returns the parent nodes of a child node with specified text.
   *
   * @param root The root node of the tweet tree.
   * @param targetText The text of the target child node.
   * @returns An array of parent TweetNode objects.
   */
  findParentNodes(root: TweetNode, targetText: string): TweetNode[] {
    const parents: TweetNode[] = [];

    const traverse = (node: TweetNode, parentNodes: TweetNode[]): boolean => {
      if (node.text === targetText) {
        parents.push(...parentNodes);
        return true;
      }
      for (const child of node.children) {
        if (traverse(child, [...parentNodes, node])) {
          return true;
        }
      }
      return false;
    };

    traverse(root, []);
    return parents;
  }
}
