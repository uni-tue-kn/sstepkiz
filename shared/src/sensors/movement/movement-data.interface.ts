import { Vector3D } from "../../common/vector3d.interface";
import { SensorData } from "../sensor-data.interface";

export interface MovementData extends SensorData {

  /**
   * Acceleration in m/(s²).
   */
  a: Vector3D;

  /**
   * Orientation in radian.
   */
  g: Vector3D;

  /**
   * Magnetic field in gauss.
   */
  m: Vector3D;

  /**
   * Pressure in hPa.
   */
  // p: number;

  /**
   * Temperature in °C.
   */
  // tp: number;

  /**
   * Identity of sensor.
   */
  id: string;
}
