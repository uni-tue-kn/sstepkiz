export class OptionsDto {
    observationNumber: number | undefined;
    textValue: string | undefined;
    nextObservationNumber: number | undefined;
    numberValue: number | undefined;
    constructor(options: {
        observationNumber?: number,
        textValue?: string,
        nextObservationNumber?: number,
        numberValue?: number,
    } = {}) {
        this.observationNumber = options.observationNumber,
            this.textValue = options.textValue,
            this.nextObservationNumber = options.nextObservationNumber,
            this.numberValue = options.numberValue
    }
}
