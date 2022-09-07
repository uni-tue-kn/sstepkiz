import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[customSensorComponent]',
})
export class CustomSensorComponentDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
