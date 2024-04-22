import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { metricRanking } from '../../data/metric-ranking';
import { T_DisplayableDataType } from '../../interfaces/displayable-data-interface';
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

  getRecommendedDisplayablesData(
    owners: string[]
  ): Observable<T_DisplayableDataType[]> {
    if (owners.length === 0) {
      console.log(owners);
      return of([]);
    }

    const basicOwnersParams: I_OwnersParams = {
      type: 'specific',
      owners: [owners[0]],
      count: 1,
    };
    const comparsionOwnersParams: I_OwnersParams = {
      type: 'specific',
      owners: [owners[0], owners[1]],
      count: 2,
    };

    if (owners.length === 1) {
      return this.metricService.metricContainer$.pipe(
        switchMap((metricContainer) =>
          this.getRecommendedDisplayables(
            [basicOwnersParams],
            'auto-stat'
          ).pipe(
            map((displayables) =>
              this.displayableProviderService.processRequests(
                metricContainer,
                displayables
              )
            )
          )
        )
      );
    }
    return this.metricService.metricContainer$.pipe(
      switchMap((metricContainer) =>
        this.getRecommendedDisplayables(
          [comparsionOwnersParams],
          'stat-comp'
        ).pipe(
          map((displayables) =>
            this.displayableProviderService.processRequests(
              metricContainer,
              displayables
            )
          )
        )
      )
    );
  }

  getRecommendedDisplayables(
    ownersParamsArr: I_OwnersParams[],
    type: T_DisplayableTypeString
  ): Observable<I_DisplayableRequest[]> {
    return this.getRecommendedMetricNames().pipe(
      map((metricNames) => {
        const displayables: I_DisplayableRequest[] = [];
        ownersParamsArr.forEach((ownersParams) => {
          metricNames.forEach((metricName) => {
            displayables.push({
              stat_name: metricName,
              ownersParams: ownersParams,
              type: type,
            });
          });
        });
        return displayables;
      })
    );
  }

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
