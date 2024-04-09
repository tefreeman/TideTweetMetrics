import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, from } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MetricContainer } from '../classes/metric-container';
import { HttpClient } from '@angular/common/http';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { I_MetricsInterface } from '../interfaces/metrics-interface';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MetricService {
  private _storage = inject(Storage);
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
  private _localStorageService = inject(LocalStorageService);
  private metricContainer: MetricContainer = new MetricContainer();
  private metricsSubscription!: Subscription; // Store the subscription
  private metricFileId = 'metrics_json';

  public metricContainer$ = new Subject<MetricContainer>();


  constructor() {
    this.initMetrics();
  }

  private initMetrics(): void {
    this.metricsSubscription = this._authService.getFileVersion(this.metricFileId).pipe(
      switchMap((fileVer) => {
        if (!fileVer) {
          console.error('No file version found for ', this.metricFileId);
          return of(null);
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
      catchError(error => {
        console.error('Error fetching metrics: ', error);
        return of(null);
      })
    ).subscribe((metrics: any) => {
      if (metrics) {
        this.setMetrics(metrics);
      }
    });
  }

  ngOnDestroy(): void {
    this.metricsSubscription.unsubscribe(); // Clean up the subscription
  }

  private fetchChartData(version: string) {
    return from(getDownloadURL(ref(this._storage, 'ex_metric_out.json'))).pipe(
      switchMap(url => this._httpClient.get<I_MetricsInterface>(url)),
      tap(data => this._localStorageService.setItem(this.metricFileId, data, version))
    );
  }

  setMetrics(metrics: I_MetricsInterface): void {
    this.metricContainer.setMetrics(metrics);
    this.metricContainer$.next(this.metricContainer);
  }
}
