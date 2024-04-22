import { I_PageMap } from './pages-interface';

/**
 * Represents a user profile.
 */
export interface I_Profile {
  id?: string;
  defaultCollege: string;
  displays: I_PageMap;
  doWantEmailReports: boolean;
}

/**
 * Represents a file version.
 */
export interface I_FileVersion {
  version: string;
  id: string;
}

/**
 * Represents a user and their role.
 */
export interface I_UserAndRole {
  uid: string;
  email: string;
  role: 'user' | 'unverified' | 'admin';
}
