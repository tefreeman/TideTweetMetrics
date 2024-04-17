import { I_DisplayableRequest } from "./displayable-interface";



export interface I_Profile {
    "defaultAccount": string,
    "displays": I_DisplayableRequest[],
    "doWantEmailReports": boolean,
}

export interface I_FileVersion {
    "version": string
    "id": string
}


export interface I_UserAndRole {
    uid: string;
    email: string;
    role: 'user' | 'unverified' | 'admin';
}