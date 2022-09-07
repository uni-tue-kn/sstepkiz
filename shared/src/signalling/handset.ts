import { CallOffer } from './call-offer.interface';
import { Peer } from '../peer/peer.class';

export interface Handset {

  /**
   * Accepts the call.
   */
  accept: (stream?: MediaStream) => Promise<Peer>;

  /**
   * Declines the call.
   */
  decline: () => void;

  /**
   * Information about call offer.
   */
  offer: CallOffer;
}
