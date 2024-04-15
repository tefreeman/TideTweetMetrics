import { IDisplayableStats, I_DisplayableRequest, I_OwnerConfig, I_OwnerData } from "../interfaces/displayable-interface";
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

    getMetricData(displayable: I_DisplayableRequest): IDisplayableStats {
      const owners = this.getOwnersForStat(displayable.stat_name);
      let ownerData: I_OwnerData[] = [];
    
      const isMetricDefined = (owner: string) => 
        this._metrics && this._metrics[displayable.stat_name] && this._metrics[displayable.stat_name][owner];
    
      const addOwnerData = (owner: string) => {
        if (isMetricDefined(owner)) {
          ownerData.push({
            owner: owner,
            value: this._metrics[displayable.stat_name][owner]
          });
        }
      };
    
      if (['all', 'top', 'bottom', 'specific'].includes(displayable.ownersConfig.type)) {
        const source = (displayable.ownersConfig.type === 'specific') ? displayable.ownersConfig.owners : owners;
        source.forEach(addOwnerData);
      }
      
      if (displayable.ownersConfig.type === 'top' || displayable.ownersConfig.type === 'bottom') {
        const isTop = displayable.ownersConfig.type === 'top';

        ownerData = this.sortAndSlice(ownerData, displayable.ownersConfig.count!, isTop);
      }
    
      const ownerObject = ownerData.reduce((obj, item) => {
        obj[item.owner] = item.value;
        return obj;
      }, {} as { [owner: string]: T_MetricValue });
    
      return {
        ...displayable,
        owners: ownerObject
      };
    }
    
    private sortAndSlice(ownerData: I_OwnerData[], count: number, isTop: boolean): I_OwnerData[] {
      const firstOrDirect = (val: any): number => {
        if (Array.isArray(val)) {
          return val.length > 0 ? val[0] : 0;
        }
        return val;
      };
    
      return ownerData.sort((a, b) => isTop ? firstOrDirect(b.value) - firstOrDirect(a.value) : firstOrDirect(a.value) - firstOrDirect(b.value))
                     .slice(0, count);
    }
    
      


    getJson(): I_MetricsInterface {
        return this._metrics;
    }
}
