import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { metricRanking } from '../../data/metric-ranking';
import { I_BaseMetricCard } from '../../interfaces/displayable-data-interface';
import {
  I_DisplayableRequest,
  I_OwnersParams,
  T_DisplayableTypeString,
} from '../../interfaces/displayable-interface';
import { AuthService } from '../auth.service';
import { MetricService } from '../metrics/metric.service';
import { DisplayableProviderService } from './displayable-provider.service';

@Injectable({
  providedIn: 'root',
})
export class RecommendedDisplayableService {
  metricService: MetricService = inject(MetricService);
  authService: AuthService = inject(AuthService);
  displayableProviderService: DisplayableProviderService = inject(
    DisplayableProviderService
  );

  constructor() {}

  /**
   * Retrieves recommended displayable data for the specified owners.
   * @param owners - An array of owner names.
   * @returns An observable that emits an array of recommended displayable data.
   */
  getRecommendedMetricCards(
    owners: string[]
  ): Observable<Array<I_BaseMetricCard & { request: I_DisplayableRequest }>> {
    if (owners.length === 0) {
      return of([]);
    }

    const basicOwnersParams: I_OwnersParams = {
      type: 'specific',
      owners: [owners[0]],
      count: 1,
    };
    const comparisonOwnersParams: I_OwnersParams = {
      type: 'specific',
      owners: [owners[0], owners[1] ? owners[1] : owners[0]], // Adjusted for safety as before
      count: 2,
    };

    const paramsToUse =
      owners.length === 1 ? [basicOwnersParams] : [comparisonOwnersParams];
    const requestType = owners.length === 1 ? 'auto-stat' : 'metric-comp';

    console.log('Owners Params: ', paramsToUse);
    return this.metricService.metricContainer$.pipe(
      switchMap((metricContainer) =>
        this.getRecommendedRequests(paramsToUse, requestType).pipe(
          map((requests) => {
            console.log('Reccomended Requests: ', requests);
            // First, process the requests to get baseMetricCards.
            const baseMetricCardsWithPossibleNulls: (I_BaseMetricCard | null)[] =
              this.displayableProviderService.processRequests(
                metricContainer,
                requests,
                'metric'
              ) as (I_BaseMetricCard | null)[];

            console.log(
              'Base Metric Cards, including possible nulls: ',
              baseMetricCardsWithPossibleNulls
            );

            const enhancedCards = baseMetricCardsWithPossibleNulls
              .map((card, index) => {
                // Only proceed if card is not null
                if (card !== null) {
                  return {
                    ...card,
                    request: requests[index], // Attach the corresponding request
                  };
                }
                return null;
              })
              .filter((card) => card !== null) as Array<
              I_BaseMetricCard & { request: I_DisplayableRequest }
            >; // Ensure the final array is free of nulls

            console.log('Enhanced Cards, nulls removed: ', enhancedCards);

            return enhancedCards;
          })
        )
      )
    );
  }

  /**
   * Retrieves recommended displayables based on the specified owners and type.
   * @param ownersParamsArr - An array of owner parameters.
   * @param type - The type of displayable.
   * @returns An observable that emits an array of displayable requests.
   */
  getRecommendedRequests(
    ownersParamsArr: I_OwnersParams[],
    type: T_DisplayableTypeString
  ): Observable<I_DisplayableRequest[]> {
    return this.getRecommendedMetricNames().pipe(
      map((metricNames) => {
        const displayables: I_DisplayableRequest[] = [];
        ownersParamsArr.forEach((ownersParams) => {
          metricNames.forEach((metricName) => {
            displayables.push({
              metricNames: [metricName],
              ownersParams: ownersParams,
              type: type,
            });
          });
        });
        return displayables;
      })
    );
  }

  /**
   * Retrieves recommended metric names.
   * @returns An observable that emits an array of metric names.
   */
  getRecommendedMetricNames(): Observable<string[]> {
    // Get all metric names from metric service
    return this.metricService.getMetricNames().pipe(
      map((metrics) => {
        // Filter out any metrics with a ranking value of 0
        const filteredMetrics = metrics.filter(
          (m) => m in metricRanking && metricRanking[m] > 0
        );

        // Sort the remaining metrics by their ranking values in descending order
        return filteredMetrics.sort((a, b) => {
          if (metricRanking[b] > metricRanking[a]) {
            return 1;
          } else if (metricRanking[b] < metricRanking[a]) {
            return -1;
          } else {
            // If ranking values are equal, sort alphabetically
            return a.localeCompare(b);
          }
        });
      })
    );
  }
}
