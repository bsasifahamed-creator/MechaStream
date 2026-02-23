declare module 'archiver' {
  interface ArchiverOptions {
    zlib?: { level?: number };
  }
  interface Archiver {
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    file(path: string, data: { name: string }): this;
    finalize(): void;
  }
  function archiver(format: string, options?: ArchiverOptions): Archiver;
  export default archiver;
}
