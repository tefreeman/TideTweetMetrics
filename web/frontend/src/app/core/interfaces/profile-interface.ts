import { I_DisplayableRequest } from "./displayable-interface";

{}

export interface I_Profile {
    "defaultAccount": string,
    "displays": I_DisplayableRequest[],
}