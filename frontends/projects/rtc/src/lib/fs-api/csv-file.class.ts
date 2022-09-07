import { FsFile } from "./fs-file.class";
import { FileSystemFileHandle, FileSystemCreateWritableOptions } from '.';

export class CsvFile extends FsFile {
  constructor(handle: FileSystemFileHandle, private readonly format: Array<string>, private readonly separator: string = ',') {
    super(handle);
  }

  async open(options: FileSystemCreateWritableOptions = { keepExistingData: false }): Promise<void> {
    await super.open(options);
    const newData = new Blob(Array.from(this.format.join(this.separator) + '\n'));
    await this.writeStream?.write(newData);
  }

  async writeRow(row: Array<string>): Promise<void> {
    const newData = new Blob(Array.from(row.join(this.separator) + '\n'));
    await this.write(newData);
  }

  static async selectCsvFile(format: Array<string>, separator: string = ','): Promise<CsvFile> {
    const fileHandle = await window.showSaveFilePicker({
      types: [{
        description: 'CSV file',
        accept: {'text/csv': ['.csv']}
      }]
    });
    return new CsvFile(fileHandle, format, separator);
  }
}
