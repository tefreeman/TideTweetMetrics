import { I_DisplayableRequest } from "./displayable-interface";


export interface I_GridRequestEntry {
  displayables: I_DisplayableRequest[];
  type: 'graph' | 'stat';
  order: number;
}

export interface I_PageMap {
  [page: string]: {
    [name: string]: I_GridRequestEntry;
  };
}
