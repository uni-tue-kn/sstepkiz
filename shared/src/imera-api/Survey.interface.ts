import { Instrument } from './Instrument.interface';

export interface Survey {
  id: string;
  title: string;
  instruments: Instrument[];
}
