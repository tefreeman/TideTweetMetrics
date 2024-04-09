import { I_MetricsInterface, T_MetricValue, I_MetricOwners } from "../interfaces/metrics-interface";

export class MetricContainer {
    _metrics: I_MetricsInterface = {}

    constructor() {}


    setMetrics(metrics: I_MetricsInterface): void {
        this._metrics = metrics;
        console.log('metrics set', this._metrics)
    }

    getStatKeys(): string[] {
        return this._metrics ? Object.keys(this._metrics) : [];
    }

    getOwnersForStat(stat_name: string): string[] {
        if (this._metrics && this._metrics[stat_name])
            return Object.keys(this._metrics[stat_name]);
        return [];
    }

    getOwnersCountForStat(stat_name: string): number {
        if (this._metrics && this._metrics[stat_name])
            return Object.keys(this._metrics[stat_name]).length;
        return 0;
    }

    getMetricData(stat_name: string, owners: string[]): T_MetricValue[] {
        let metrics: T_MetricValue[] = []
        for (let owner of owners) {
          if (this._metrics && this._metrics[stat_name] && this._metrics[stat_name][owner])
            metrics.push(this._metrics[stat_name][owner]);
        }
        return metrics;
    }

    getJson(): I_MetricsInterface {
        return this._metrics;
    }
}
