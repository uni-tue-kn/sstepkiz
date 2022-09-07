export class ObservationDto {
    observationNumber: number| undefined;
    text: string | undefined;
    observationType: string;
    dataType: string | undefined;
    flag_singlechoice: boolean | undefined;
    unit: string;
    nextObservationNumber: number | undefined;
    topic1: string | undefined;
    topic1Description: string | undefined;
    scale: string | undefined;
    lowerBound: number | undefined;
    upperBound: number | undefined;
    stepSize: number | undefined;
    optional: boolean | undefined;
    constructor(options: {
        observationNumber?: number,
        text?: string,
        observationType?: string,
        dataType?: string,
        flag_singlechoice?: boolean,
        unit?: string,
        nextObservationNumber?: number,
        topic1?: string,
        topic1Description?: string,
        scale?: string,
        lowerBound?: number,
        upperBound?: number,
        stepSize?: number,
        optional?: boolean,
    } = {}) {
        this.observationNumber = options.observationNumber,
        this.text = options.text,
        this.observationType = options.observationType || 'Frage',
        this.dataType = options.dataType,
        this.flag_singlechoice = options.flag_singlechoice,
        this.unit = options.unit || '',
        this.nextObservationNumber = options.nextObservationNumber,
        this.topic1 = options.topic1,
        this.topic1Description =options.topic1Description
        this.scale = options.scale,
        this.lowerBound = options.lowerBound,
        this.upperBound = options.lowerBound,
        this.stepSize = options.stepSize,
        this.optional = options.optional;
     }

}
