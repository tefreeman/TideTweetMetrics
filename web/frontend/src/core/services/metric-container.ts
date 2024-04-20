import { IDisplayableData, I_DisplayableRequest, I_OwnersParams, I_OwnerData } from "../interfaces/displayable-interface";
import { I_MetricsInterface, T_MetricValue, I_MetricOwners } from '../interfaces/metrics-interface';
import { KeyTranslatorService } from "./key-translator.service";

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

    getStatByOwner(stat_name: string, owner: string): I_MetricOwners {
        return this._metrics[stat_name];
    }

    isMetricDefined(stat_name: string, owner: string): boolean {
      return this._metrics && stat_name in this._metrics && owner in this._metrics[stat_name];
    }

    getAllOwnerNamesByStats(stat_name: string): string[] {
        if (this._metrics && this._metrics[stat_name])
            return Object.keys(this._metrics[stat_name]);
        return [];
    }
    getOwnersCountForStat(stat_name: string): number {
        if (this._metrics && this._metrics[stat_name])
            return Object.keys(this._metrics[stat_name]).length;
        return 0;
    }


    addSpecificOwnerData(displayable: I_DisplayableRequest): IDisplayableData {
      // Initialize an empty object to hold owner data
      let ownersObj: { [key: string]: T_MetricValue } = {};
      
      // Iterate through the list of owners specified in the displayable request
      displayable.ownersParams.owners.forEach((owner) => {
        if (this.isMetricDefined(displayable.stat_name, owner)) {
            // Populate the ownersObj with data from the metrics
            ownersObj[owner] = this._metrics[displayable.stat_name][owner];
        }
      });
      
      // Construct and return the IDisplayableStats object
      return {
        ...displayable, // Spread the existing properties of the displayable object
        owners: ownersObj // Include the constructed owners data
      };
    }

    getMetricData(displayable: I_DisplayableRequest): IDisplayableData {
      console.log('displayable', displayable);
      
      if (displayable.ownersParams.type === 'specific') {
        return this.addSpecificOwnerData(displayable);
      }
    
      let ownerData: I_OwnerData[] = [];
    
    
      // Retrieve all owners if the configuration is not specific. This essentially handles 'all', 'top', and 'bottom'.
      const owners = this.getAllOwnerNamesByStats(displayable.stat_name);
    
      // Populate ownerData for all owners relevant to the stat
      owners.forEach((owner) => {
        if (this.isMetricDefined(displayable.stat_name, owner)) {
          ownerData.push({
            owner: owner,
            value: this._metrics[displayable.stat_name][owner]
          });
        }
      });
    
      // If type is 'top' or 'bottom', sort and slice the ownerData array accordingly
      if (displayable.ownersParams.type === 'top' || displayable.ownersParams.type === 'bottom') {
        const isTop = displayable.ownersParams.type === 'top';
        const cutOff = displayable.ownersParams.count ? displayable.ownersParams.count + (displayable.ownersParams.owners ? displayable.ownersParams.owners.length : 0) : ownerData.length;
        ownerData = this.sortAndSlice(ownerData, cutOff, isTop);
      }
    
      // Convert ownerData array to an object in the format { owner: value }
      const ownerObject = ownerData.reduce((obj, item) => {
        obj[item.owner] = item.value;
        return obj;
      }, {} as { [owner: string]: T_MetricValue });
    
      // Return the augmented displayable object with the owner data included
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


