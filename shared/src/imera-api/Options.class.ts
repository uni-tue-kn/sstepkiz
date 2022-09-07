export class Options {
  constructor(
    public id?: number,
    public nextObservation: { observationNumber: number | null } = { observationNumber: null },
    public textValue?: string,
    public numberValue?: number
  ) {}
}
