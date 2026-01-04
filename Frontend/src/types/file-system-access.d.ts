export {};

declare global {
  interface FileSystemWritableFileStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    close(): Promise<void>;
  }

  interface FileSystemFileHandle {
    createWritable(
      options?: { keepExistingData?: boolean }
    ): Promise<FileSystemWritableFileStream>;
  }
}