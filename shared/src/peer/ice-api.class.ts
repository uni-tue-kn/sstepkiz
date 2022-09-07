import { IceCredential } from "./ice-credential.interface";

export class IceApi {
  constructor(readonly baseUrl: string) { }

  async getCredentials(): Promise<IceCredential> {
    return {
      credential: 'stunpassword',
      username: 'stunuser',
      validTo: new Date(Date.now() + 3600),
    };
  }
}
