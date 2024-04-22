/**
 * Represents a key translator interface.
 */
export interface I_KeyTranslator {
  [key: string]: {
    /**
     * The abbreviated version of the key.
     */
    abr?: string;
    /**
     * The full version of the key.
     */
    full: string;
    /**
     * The description of the key.
     */
    desc?: string;
    /**
     * The order of the key.
     */
    order: number;
  };
}
