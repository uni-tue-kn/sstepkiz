import { ModuleWithProviders, NgModule } from '@angular/core';

import { ImeraApiService } from './services/imera-api.service';
import { ImeraApiModuleConfiguration } from './types/imera-api-module-configuration.class';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
  ]
})
export class ImeraApiModule {

  static forRoot(config: ImeraApiModuleConfiguration): ModuleWithProviders<ImeraApiModule> {
    return {
      ngModule: ImeraApiModule,
      providers: [
        {provide: ImeraApiModuleConfiguration, useValue: config }
      ]
    };
  }
}
