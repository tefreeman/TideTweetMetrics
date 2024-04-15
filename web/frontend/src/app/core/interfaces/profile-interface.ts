import { I_DisplayableRequest } from "./displayable-interface";



export interface I_Profile {
    "defaultAccount": string,
    "displays": I_DisplayableRequest[],
}

export interface I_FileVersion {
    "version": string
    "id": string
}
