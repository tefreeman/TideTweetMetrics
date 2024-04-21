import { I_PageMap } from './pages-interface';

export interface I_Profile {
  id?: string;
  defaultCollege: string;
  displays: I_PageMap;
  doWantEmailReports: boolean;
}

export interface I_FileVersion {
  version: string;
  id: string;
}

export interface I_UserAndRole {
  uid: string;
  email: string;
  role: 'user' | 'unverified' | 'admin';
}
