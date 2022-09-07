import { Vector3D } from "../vector3d.interface";
import { IsNumber } from 'class-validator';

export class Vector3dDto implements Vector3D {
  
  /**
   * X-dimension of vector.
   */
  @IsNumber()
  x = 0;

  /**
   * Y-dimension of vector.
   */
  @IsNumber()
  y = 0;

  /**
   * Z-dimension of vector.
   */
  @IsNumber()
  z = 0;
}
