import { Injectable } from '@nestjs/common';

import { CommunicationService } from '../services/communication/communication.service';

const STORE: { [key: string]: any } = {};

@Injectable()
export class VariablesService {

  constructor(private readonly comService: CommunicationService) {
    STORE['foo'] = 'bar' + Math.random();
    this.comService.on('connected', (channel) => {
      if (channel.label === 'vars') {
        channel.send(JSON.stringify(STORE));
      }
    });
  }

  containsKey(key: string): boolean {
    return key in STORE;
  }

  get(key: string): any {
    return STORE[key];
  }

  getAllJson(): string {
    return JSON.stringify(STORE);
  }

  set(key: string, value: any): void {
    STORE[key] = value;
    const comChannels = this.comService.getChannelsByLabel('vars');
    comChannels.forEach((ch) => {
      ch.send(JSON.stringify({ [key]: value }));
    });
  }
}
