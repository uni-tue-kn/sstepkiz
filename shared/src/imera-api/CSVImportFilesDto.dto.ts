import { ObservationDto } from './ObservationDto.dto';
import { OptionsDto } from './OptionsDto.dto';

export class CSVImportFilesDto {
    constructor(
    public csvObservationDtos: ObservationDto[] = [],
    public csvOptionDtos: OptionsDto[] = []
    ) { }
}
