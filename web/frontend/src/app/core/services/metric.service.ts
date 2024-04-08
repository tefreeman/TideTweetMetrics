import { inject, Injectable } from '@angular/core';
import { MetricContainer } from '../classes/metric-container';
import { Subject } from 'rxjs';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { MetricsInterface } from '../interfaces/metrics-interface';
import { AuthService } from './auth.service';


export class MetricService {
  private _storage = inject(Storage);
  private httpclient = inject(HttpClient);
  private _auth_service= inject(AuthService);
  
  public MetricContainer: MetricContainer = new MetricContainer();
  public subject = new Subject<void>();

  constructor() {
    if(this.loadFromLocalStorage()) {
      this.subject.next();
    } else {
      this.getChartData();
      this.subject.next();
    }
  }


  getChartData(): void {
    console.log('getting chart data from db')
    getDownloadURL(ref(this._storage, 'ex_metric_out.json')).then((url) => {
      this.httpclient.get<MetricsInterface>(url).subscribe((data) => {
        this.MetricContainer.setMetrics(data);
        this.saveMetrics();
      });
  });
}
  loadFromLocalStorage(): Boolean {
    
    let metrics = localStorage.getItem('metrics');
    if (metrics) {
      console.log('getting chart data from local storage')
      this.MetricContainer.setMetrics(JSON.parse(metrics));
      return true;
    }
    return false;
  }

  saveMetrics(): void {
    localStorage.setItem('metrics', JSON.stringify(this.MetricContainer.getJson()));
    localStorage.setItem('metricsVersion', "1.0.0");
  }
}
