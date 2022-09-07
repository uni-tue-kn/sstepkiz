import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImeraApiModuleConfiguration {

  /**
   * Root URL of Imera Server.
   */
  readonly imeraServerRootUrl: string = '';
}
