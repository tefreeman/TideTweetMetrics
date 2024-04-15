import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { MetricContainer } from './metric-container';
import { HttpClient } from '@angular/common/http';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { I_MetricsInterface } from '../interfaces/metrics-interface';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import { KeyTranslatorService } from './key-translator.service';

@Injectable({
  providedIn: 'root',
})
export class MetricService {
  private _storage = inject(Storage);
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _localStorageService = inject(LocalStorageService);
  private _keyTranslatorService = inject(KeyTranslatorService);
  private metricFileId = 'metrics_json';

  constructor() {

  }

  public getMetricContainer$(): Observable<MetricContainer> {
    const metricContainer = new MetricContainer();
    // Transforming the entire flow into a single observable that can be subscribed to from a component
    return this._authService.getFileVersion(this.metricFileId).pipe(
      switchMap(fileVer => {
        if (!fileVer) {
          console.error('No file version found for ', this.metricFileId);
          return throwError(() => new Error('No file version found'));
        }
        console.log(fileVer);
        const result = this._localStorageService.getItem<I_MetricsInterface>('metrics_json', fileVer.version);
        if (result) {
          console.log('Getting data from local storage');
          return of(result);
        } else {
          console.log('Getting new data from db');
          return this.fetchChartData(fileVer.version);
        }
      }),
      map(metrics => {
        if (metrics) {
          metricContainer.setMetrics(metrics);

          const metricNames: any = {};
          for(const metricName in metrics) {
            metricNames[metricName] = this._keyTranslatorService.translateKey(metricName);
          }
          console.log(metricNames);
        }
        return metricContainer;
      }),
      catchError(error => {
        console.error('Error fetching metrics: ', error);
        return throwError(() => new Error(error));
      })
    );
  }

  private fetchChartData(version: string): Observable<I_MetricsInterface> {
    return from(getDownloadURL(ref(this._storage, 'ex_metric_out.json'))).pipe(
      switchMap(url => this._httpClient.get<I_MetricsInterface>(url)),
      tap(data => this._localStorageService.setItem(this.metricFileId, data, version))
    );
  }

}
