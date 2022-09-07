export interface AggregatorConfig {

  /**
   * Time between configuration pulls in seconds.
   */
  pullInterval: number;

  /**
   * Times of day when to upload local data in 'hh:mm:ss±zz' format.
   */
  uploadTimes: string[];
}
