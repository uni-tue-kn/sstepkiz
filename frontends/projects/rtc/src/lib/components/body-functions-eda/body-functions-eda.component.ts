import { Component, OnInit, Input } from '@angular/core';
import { EdaData, EdaRxChannel, DeviceType, ChannelType, Peer } from '@sstepkiz';
import { AuthService } from 'projects/auth/src/public-api';
import { RtcService } from '../../services/rtc.service';

@Component({
  selector: 'lib-rtc-body-functions-eda',
  templateUrl: './body-functions-eda.component.html',
  styleUrls: ['./body-functions-eda.component.scss']
})
export class BodyFunctionsEdaComponent implements OnInit {
  /**
   * Number of currently active peer connections.
   */
  private activeCalls: number = 0;

  /**
   * Identity of selected user.
   */
  @Input() userId: string;


  edaData: EdaData = { t: 0, edaValue: 0 };

  /**
   * Gets, if call is active.
   */
  get isCallActive(): boolean {
    return this.activeCalls > 0;
  }

  /**
   * Declares device type enum for template.
   */
  modes = DeviceType;

  /**
   * Username of the partner.
   */
  readonly partner = { socketId: '', userId: '' };

  /**
   * Gets all senders.
   */
  get sender(): { socketId: string, userId: string } {
    // Cancel if no senders exist.
    if (!this.rtcService.senders || Object.getOwnPropertyNames(this.rtcService.senders).length < 1) { return null; }
    // Extract all socketId-userId pairs from senders.
    const userIds = Object.getOwnPropertyNames(this.rtcService.senders);
    
    const userId = userIds.find(userId => userId === this.userId);
    const socketId = this.rtcService.senders[userId]?.slice(-1).toString();
    return { socketId, userId };
  }

  /**
   * Gets the selected channel type.
   */
  type: ChannelType = ChannelType.eda;

  /**
   * Gets the username of the current user.
   */
  get username(): string {
    if (this.authService.isAuthenticated) {
      return this.authService.claims.preferred_username;
    } else {
      return '[not authenticated]';
    }
  }

  /**
   * Constructs a new component to test RTC functionalities.
   * @param authService Auth service instance.
   * @param rtcService RTC service instance.
   */
  constructor(
    private readonly authService: AuthService,
    public readonly rtcService: RtcService,
  ) {}


  /**
   * Calls a remote socket.
   * @param userId Identity of user to call.
   * @param socketId Identity of socket to call.
   * @param mode Mode of call.
   */
  async call(userId: string, socketId: string, mode: DeviceType.Monitor | DeviceType.Receiver): Promise<void> {
    console.log(`Connecting to ${userId} on socket ${socketId} in mode ${mode}`);
    // This needs to be done only once for the whole session:
    try {
      await this.rtcService.call(userId, socketId, mode);
    } catch (error) {
      console.error(error);
      this.hangup();
    }
  }

  /**
   * Hangs up the call.
   */
  hangup(): void {
    this.partner.socketId = '';
    this.partner.userId = '';
  }

  /**
   * Initializes the component.
   */
  async ngOnInit(): Promise<void> {
    // This needs to be done for each component which needs to access peer instances to a specific user.
    this.rtcService.getPeer(this.userId).subscribe(async peer => {
      // Update number of active calls to update isCallActive property for UI.
      this.activeCalls++;

      // Request to open an eye tracking channel.
      const channels = await peer.requestChannels(this.rtcService.signallingChannel, ChannelType.eda);
      // Cast opened channel to eye tracking rx channel.
      const ch = channels[0] as EdaRxChannel;
      // Subscribe events.
      const onData = (data: EdaData) => {
        // Apply new eye gaze data.
        this.edaData = data;
      };
      const onClose = () => {
        // Eye Tracking Channel is closed now.
        this.activeCalls--;
        ch.removeListener('closed', onClose);
        ch.removeListener('message', onData);
      };
      ch.addListener('closed', onClose);
      ch.addListener('message', onData);
    });
  }

  /**
   * Requests to open the selected channel.
   */
  open(peer: Peer): void {
    if (!peer || !this.rtcService.signallingChannel) {
      throw new Error('undefined!');
    }
    peer.requestChannels(this.rtcService.signallingChannel, this.type);
  }

}
