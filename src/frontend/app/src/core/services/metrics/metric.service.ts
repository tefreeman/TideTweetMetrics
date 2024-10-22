import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Storage, getDownloadURL, ref } from '@angular/fire/storage';
import { I_MetricJsonData } from '../../interfaces/displayable-interface';
import { AuthService } from '../auth.service';
import { KeyTranslatorService } from '../key-translator.service';
import { LocalStorageService } from '../local-storage.service';
import { MetricContainer } from './metric-container';

@Injectable({
  providedIn: 'root',
})
/**
 * Service for retrieving and managing metrics.
 */
export class MetricService {
  private _storage = inject(Storage);
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _localStorageService = inject(LocalStorageService);
  private _keyTranslatorService = inject(KeyTranslatorService);
  private metricFileId = 'metrics_out';

  private metricContainerSubject$ = new BehaviorSubject<MetricContainer | null>(
    null
  );

  /**
   * Observable that emits the metric container.
   */
  public metricContainer$: Observable<MetricContainer> =
    this.metricContainerSubject$
      .asObservable()
      .pipe(filter((mc) => mc !== null)) as Observable<MetricContainer>;

  constructor() {
    // Initialize the MetricContainer data retrieval as soon as the service is constructed
    this.initMetricContainer();
  }

  /**
   * Retrieves the names of all metrics.
   * @returns An observable that emits an array of metric names.
   */
  public getMetricNames(): Observable<string[]> {
    return this.metricContainer$.pipe(
      map((metricContainer) => metricContainer.getStatKeys())
    );
  }

  /**
   * Retrieves the owners for a specific metric.
   * @param metricName - The name of the metric.
   * @returns An observable that emits an array of owners.
   */
  public getOwnersForStat(metricName: string): Observable<string[]> {
    return this.metricContainer$.pipe(
      map((metricContainer) =>
        metricContainer.getAllOwnerNamesByStat(metricName)
      )
    );
  }

  private initMetricContainer(): void {
    this.getMetricContainer$().subscribe({
      next: (metricContainer) => {
        this.metricContainerSubject$.next(metricContainer);
      },
      error: (err) => {
        console.error('Failed to initialize MetricContainer', err);
      },
    });
  }

  private getMetricContainer$(): Observable<MetricContainer> {
    const metricContainer = new MetricContainer();
    return this._authService.getFileVersion(this.metricFileId).pipe(
      switchMap((fileVer) => {
        if (!fileVer) {
          console.error('No file version found for ', this.metricFileId);
          return throwError(() => new Error('No file version found'));
        }
        const result = this._localStorageService.getItem<I_MetricJsonData>(
          this.metricFileId,
          fileVer.version
        );
        if (result) {
          return of(result);
        } else {
          return this.fetchChartData(fileVer.version);
        }
      }),
      map((metrics) => {
        if (metrics) {
          metricContainer.setMetrics(metrics);
          const metricNames: any = {};
          for (const metricName in metrics) {
            metricNames[metricName] =
              this._keyTranslatorService.keyToFullString(metricName);
          }
        }
        return metricContainer;
      }),
      catchError((error) => {
        console.error('Error fetching metrics: ', error);
        return throwError(() => new Error(error));
      })
    );
  }

  private fetchChartData(version: string): Observable<I_MetricJsonData> {
    return from(
      getDownloadURL(ref(this._storage, this.metricFileId + '.json'))
    ).pipe(
      switchMap((url) => this._httpClient.get<I_MetricJsonData>(url)),
      tap((data) =>
        this._localStorageService.setItem(this.metricFileId, data, version)
      )
    );
  }
}
