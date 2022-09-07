import * as fs from 'fs';

export async function readSecret(
  configService: { get: <T>(propertyPath: string, defaultValue?: T) => T },
  name: string,
  defaultValue?: string,
): Promise<string> {
  const readFirstLine = (fileName: string) => {
    return new Promise<string>((resolve, reject) => {
      const fileStream = fs.createReadStream(fileName);
      let index = -1;
      let line = '';
      fileStream
        .on('data', chunk => {
          index = chunk.indexOf('\r');
          if (index === -1) {
            index = chunk.indexOf('\n');
          }
          if (index !== -1) {
            line += chunk.slice(0, index);
            fileStream.close();
          } else {
            line += chunk;
          }
        })
        .on('close', () => {
          resolve(line);
        })
        .on('error', error => {
          console.error('Failed to read ');
          reject(error);
        });
    });
  };
  const readSecret = async (
    name: string,
    defaultValue?: string | undefined,
  ) => {
    const fileName = configService.get<string>(name + '_FILE', undefined);
    if (fileName) {
      try {
        return await readFirstLine(fileName);
      } catch (error) {
        console.error(`Failed to read file "${fileName}"`);
        return configService.get<string>(name, defaultValue);
      }
    } else {
      return configService.get<string>(name, defaultValue);
    }
  };

  return await readSecret(name, defaultValue);
}
