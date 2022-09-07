import { Component, ComponentFactoryResolver, Input, OnInit, Type, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CustomSensorComponentDirective } from '../../interfaces/custom-sensor-component.directive';
import { CustomSensorComponent } from '../../interfaces/custom-sensor-component.interface';
import { Sensor } from '../../interfaces/sensor.class';
import { YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';

@Component({
  selector: 'app-sensor-tile',
  styleUrls: ['./sensor-tile.component.scss'],
  templateUrl: './sensor-tile.component.html',
})
export class SensorTileComponent implements OnInit {

  /**
   * Reference to sensor instance.
   */
  @Input()
  sensor?: Sensor;

  /**
   * Custom component for sensor.
   */
  @ViewChild(CustomSensorComponentDirective, { static: true })
  customSensorComponent: CustomSensorComponentDirective;

  /**
   * Gets the title for the sensor by sensor type.
   */
  get title(): string {
    switch (this.sensor?.type) {
      case 'ecg': return 'Herzfrequenz';
      case 'eda': return 'Schweiß';
      case 'etk': return 'Augenbewegung';
      case 'mov': return 'Bewegung';
      default: return 'Unbekannt';
    }
  }

  /**
   * Constructs a new Sensor Tile component.
   * @param componentFactoryResolver Resolver instance for component factory.
   * @param dialog Material dialog reference.
   */
  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly dialog: MatDialog,
  ) {}

  /**
   * Loads a custom sensor component.
   * @param customComponent Type of custom component to load.
   * @param sensor Reference to sensor instance.
   */
  private loadCustomSensorComponent(customComponent: Type<any>, sensor: Sensor) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(customComponent)
    const viewContainerRef = this.customSensorComponent.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent<CustomSensorComponent>(componentFactory);
    componentRef.instance.sensor = sensor;
  }

  /**
   * Resets the driver.
   */
  async reset(): Promise<void> {
    const ref = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: 'Sensor zurücksetzen',
        body: `Soll der Sensor ${this.sensor?.driver} wirklich zurückgesetzt werden?`
      }
    });
    const result = await ref.afterClosed().toPromise();
    if (result) {
      this.sensor?.reset();
    }
  }

  async startCalibrating(): Promise<void> {
    const ref = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: 'Kalibrierung starten',
        body: `Soll die Kalibrierung des Sensors ${this.sensor?.driver} wirklich gestartet werden?`
      }
    });
    const result = await ref.afterClosed().toPromise();
    if (result) {
      await this.sensor?.startCalibrating();
    }
  }
  async startRecording(): Promise<void> {
    if (this.sensor?.capabilities.calibratable && !this.sensor?.calibrationState) {
      const ref = this.dialog.open(YesNoDialogComponent, {
        data: {
          title: 'Aufnahme starten',
          body: `Der Sensor ${this.sensor?.driver} ist nicht kalibriert! Soll die Aufnahme dennoch gestartet werden?`
        }
      });
      const result = await ref.afterClosed().toPromise();
      if (!result) return;
    }
    await this.sensor?.startRecording();
  }

  /**
   * Initializes the custom component.
   */
   ngOnInit(): void {
    if (this.sensor?.customComponent) {
      this.loadCustomSensorComponent(this.sensor.customComponent, this.sensor);
    }
  }
}
