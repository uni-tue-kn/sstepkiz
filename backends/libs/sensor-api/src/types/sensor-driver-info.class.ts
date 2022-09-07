import { Injectable } from "@nestjs/common";
import { SensorDriverConfiguration } from "..";

@Injectable()
export class SensorDriverInfo {
  constructor(readonly config: SensorDriverConfiguration) {}
}
