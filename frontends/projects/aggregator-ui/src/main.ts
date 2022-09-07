import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from 'projects/aggregator-ui/src/environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Prevent reload.
window.addEventListener('beforeunload', (e) => {
  const msg = 'Dies könnte zu Problemen mit der Anwendung führen';
  e.returnValue = msg;
  return msg;
});
if ('wakeLock' in navigator) {
  navigator['wakeLock'].request('screen');
} else {
  console.warn('Browser does not support Wake Lock!');
}
