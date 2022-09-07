import { Injectable } from '@nestjs/common';
import { IceApi, IceCredential, RtcConfig } from '../../../../../shared/dist';

@Injectable()
export class IceApiService {
  private readonly iceApi = new IceApi(this.config.signallingServerUrl);
  private cachedCredential: IceCredential = undefined;

  constructor (private readonly config: RtcConfig) { }

  async getIceCredential(): Promise<IceCredential> {
    if (!this.cachedCredential) {
      this.cachedCredential = await this.iceApi.getCredentials();
    }
    return this.cachedCredential;
  }
}
