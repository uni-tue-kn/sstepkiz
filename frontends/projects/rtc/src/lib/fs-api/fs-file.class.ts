import { FileSystemFileHandle, FileSystemWritableFileStream, SaveFilePickerOptions, FileSystemCreateWritableOptions } from '.';

export class FsFile {
  protected writeStream?: FileSystemWritableFileStream;

  get file(): File {
    return this.handle.getFile();
  }

  get locked(): boolean {
    return this.writeStream?.locked ?? false;
  }

  constructor(private readonly handle: FileSystemFileHandle) {}

  async close(): Promise<void> {
    await this.writeStream?.close();
  }

  static async selectFile(options: SaveFilePickerOptions): Promise<FsFile> {
    const fileHandle = await window.showSaveFilePicker(options);
    return new FsFile(fileHandle);
  }

  async open(options: FileSystemCreateWritableOptions = { keepExistingData: false }): Promise<void> {
    if (this.writeStream) return;
    this.writeStream = await this.handle.createWritable(options);
  }

  async write(data: BufferSource | Blob): Promise<void> {
    await this.writeStream?.write(data);
  }
}
