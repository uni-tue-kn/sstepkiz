
export declare class FileSystemWritableFileStream extends WritableStream {
  close(): Promise<undefined>;

  /**
   * Writes content into the file the method is called on, at the current file cursor offset.
   * @param data File data to write.
   */
  write(data: BufferSource | Blob | { type: 'write' | 'seek' | 'truncate', data: BufferSource | Blob, position?: any, size?: number }): Promise<undefined>;

  /**
   * Updates the current file cursor offset to the position (in bytes) specified.
   * @param position An unsigned long describing the byte position from the top (beginning) of the file.
   */
  seek(position: any): Promise<undefined>;

  /**
   * Resizes the file associated with the stream to be the specified size in bytes.
   * @param size Amount of bytes to resize the stream to.
   */
  truncate(size: number): Promise<undefined>;
}

export declare interface FileSystemCreateWritableOptions {
  /**
   * If `false` or not specified, the temporary file starts out empty, otherwise the existing file is first copied to this temporary file.
   */
  keepExistingData: boolean;
}

export declare class FileSystemFileHandle {
  /**
   * Creates a FileSystemWritableFileStream that can be used to write to a file.
   */
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;

  /**
   * Returns a file object representing the state on disk of the entry represented by the handle.
   */
  getFile(): File;
}

export declare interface SaveFilePickerOptions {
  /**
   * A Boolean. Default false. By default the picker should include an option to not apply any file type filters (instigated with the type option below). Setting this option to true means that option is not available.
   */
  excludeAcceptAllOption?: boolean;
  /**
    * An Array of allowed file types to save.
    */
  types: Array<{
    /**
     * Description of the category of files types allowed.
     */
    description?: string,
    /**
     * An Object with the keys set to the MIME type and the values an Array of file extensions (see below for an example).): Promise<FileSystemFileHandle>;
     * @example 'text/plain': ['.txt']
     */
    accept: {[mimeType: string]: Array<string>}
  }>;
}

export {}
declare global {
  interface Window {
    showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  }
}
