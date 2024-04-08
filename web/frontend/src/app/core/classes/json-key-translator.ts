interface IJsonKeyTranslator {
    [key: string]: {
        "abr"?: string;
        "full": string;
        "desc"?: string;
    };
}

export class JsonKeyTranslator {
    private _translationObject: IJsonKeyTranslator;

    constructor(translationObject: IJsonKeyTranslator) {
        this._translationObject = translationObject;
    }

    translateKey(key: string): string {
        return this._translationObject[key]?.full ?? key;
    }

    hasAbr(key: string): boolean {
        return !!this._translationObject[key]?.abr;
    }

    hasDesc(key: string): boolean {
        return !!this._translationObject[key]?.desc;
    }

    translateKeyAbr(key: string): string {
        return this._translationObject[key]?.abr ?? key;
    }

    translateKeyDesc(key: string): string {
        return this._translationObject[key]?.desc ?? key;
    }
}
