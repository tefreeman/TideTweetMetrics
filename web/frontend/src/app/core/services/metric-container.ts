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
        let ownerData: I_OwnerData[] = [];
        

        let owners = this.getOwnersForStat(displayable.stat_name);

        if (displayable.ownersConfig.type === 'all' || displayable.ownersConfig.type === 'top' || displayable.ownersConfig.type === 'bottom') {
          for (let owner of owners) {
            if (this._metrics && this._metrics[displayable.stat_name] && this._metrics[displayable.stat_name][owner]) {
              ownerData.push({
                owner: owner,
                value: this._metrics[displayable.stat_name][owner]
              });
            }
          }
        }

        if (displayable.ownersConfig.type === 'specific') {
          for (let owner of displayable.ownersConfig.owners) {
            if (this._metrics && this._metrics[displayable.stat_name] && this._metrics[displayable.stat_name][owner]) {
              ownerData.push({
                owner: owner,
                value: this._metrics[displayable.stat_name][owner]
              });
            }
          }
        }

        if (displayable.ownersConfig.type === 'top') {
            ownerData = ownerData.sort((a, b) => {
              // Helper function to obtain the first element or return the number
              const firstOrDirect = (val:any ) => {
                if (Array.isArray(val)) {
                  return val.length > 0 ? val[0] : 0; 
                }
                return val;
              };
  
              const aValue = firstOrDirect(a.value);
              const bValue = firstOrDirect(b.value);
              
              return bValue - aValue; // Ascending sort
            }).slice(0, displayable.ownersConfig.count);
          }

          if (displayable.ownersConfig.owners.length> 0) {
            for (let owner of displayable.ownersConfig.owners) {
              if (this._metrics && this._metrics[displayable.stat_name] && this._metrics[displayable.stat_name][owner]) {
                ownerData.push({
                  owner: owner,
                  value: this._metrics[displayable.stat_name][owner]
                });
              }
            }
          }


        let ownerObject = ownerData.reduce((obj, item) => {
          obj[item.owner] = item.value;
          return obj;
        }, {} as { [owner: string]: T_MetricValue });
      
        return {
          ...displayable,
          owners: ownerObject
        };
      }
      


    getJson(): I_MetricsInterface {
        return this._metrics;
    }
}
