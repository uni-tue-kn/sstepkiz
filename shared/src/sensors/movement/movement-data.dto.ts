import { IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

import { Vector3dDto } from "../../common/dtos/vector3d.dto";
import { MovementData } from "./movement-data.interface";

export class MovementDataDto implements MovementData {

  /**
   * Acceleration in m/(s²).
   */
  @ValidateNested({ each: true })
  a: Vector3dDto = new Vector3dDto();

  /**
   * Orientation in radian.
   */
  @ValidateNested({ each: true })
  g: Vector3dDto = new Vector3dDto();

  /**
   * Magnetic field in gauss.
   */
  @ValidateNested({ each: true })
  m: Vector3dDto = new Vector3dDto();

  /**
   * Pressure in hPa.
   */
  // @IsNumber()
  // p = 0;

  /**
   * Temperature in °C.
   */
  // @IsNumber()
  // tp = 0;

  /**
   * UTC Date time when data was collected.
   */
  @IsNumber()
  t = new Date().getUTCDate();

  /**
   * Identity of sensor.
   */
  @IsString()
  @IsNotEmpty()
  id = '';
}
