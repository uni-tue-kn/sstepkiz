import { Component, OnInit } from '@angular/core';
import { AggregatorConfig } from '@sstepkiz';

import { AggregatorConfigurationService } from '../../services/aggregator-configuration.service';

@Component({
  selector: 'lib-aggregator-admin',
  templateUrl: './aggregator-admin.component.html'
})
export class AggregatorAdminComponent implements OnInit {

  configurations: { [targetUser: string]: AggregatorConfig } = {};

  readonly newConfiguration: { configuration: AggregatorConfig, targetUser: string } = {
    configuration: {
      pullInterval: 3600,
      uploadTimes: [ '00:00:00+00' ]
    },
    targetUser: ''
  };

  constructor(private readonly aggregatorConfigService: AggregatorConfigurationService) {}

  async createConfiguration(config: AggregatorConfig): Promise<void> {
    this.newConfiguration.configuration = config;
    const targetUser = this.newConfiguration.targetUser;
    try {
      const newConfig = await this.aggregatorConfigService.createConfiguration(targetUser, config);
      this.configurations[targetUser] = newConfig;
    } catch (error) {
      console.error(error);
    }
  }

  async removeConfiguration(targetUser: string): Promise<void> {
    try {
      await this.aggregatorConfigService.removeConfiguration(targetUser);
      delete this.configurations[targetUser];
    } catch (error) {
      console.error(error);
    }
  }

  async updateConfiguration(targetUser: string, configuration: AggregatorConfig) {
    try {
      const newConfig = await this.aggregatorConfigService.updateConfiguration(targetUser, configuration);
      this.configurations[targetUser] = newConfig;
    } catch (error) {
      console.error(error);
    }
  }

  async ngOnInit(): Promise<void> {
    this.configurations = await this.aggregatorConfigService.findAllConfigurations();
  }
}
