import { Injectable } from '@angular/core';
import { IceApi, IceCredential, RtcConfig } from '@sstepkiz';

@Injectable({
  providedIn: 'root'
})
export class IceApiService {
  private readonly iceApi = new IceApi(this.config.signallingServerUrl);
  private cachedCredentials: IceCredential = undefined;

  constructor(private readonly config: RtcConfig) { }

  async getCredentials(): Promise<IceCredential> {
    if (!this.cachedCredentials) {
      this.cachedCredentials = await this.iceApi.getCredentials();
    }
    return this.cachedCredentials;
  }
}
