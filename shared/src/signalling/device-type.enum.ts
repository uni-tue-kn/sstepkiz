export enum DeviceType {

  /**
   * Monitor that only listens to start and stop events of streaming and recording.
   * E.g. Patient UI App.
   */
  Monitor = 'monitor',

  /**
   * Receiver of streaming data.
   * E.g. Therapist UI App.
   */
  Receiver = 'receiver',

  /**
   * Sender that sends data.
   * E.g. Aggregator Software.
   */
  Sender = 'sender'
}
