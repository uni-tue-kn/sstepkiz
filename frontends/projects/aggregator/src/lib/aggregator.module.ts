import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AggregatorAdminComponent } from './components/aggregator-admin/aggregator-admin.component';
import { AggregatorConfigComponent } from './components/aggregator-config/aggregator-config.component';

@NgModule({
  declarations: [AggregatorAdminComponent, AggregatorConfigComponent],
  exports: [AggregatorAdminComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ]
})
export class AggregatorModule {}
