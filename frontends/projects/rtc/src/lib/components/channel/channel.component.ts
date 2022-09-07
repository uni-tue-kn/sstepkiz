import { Component, Input } from '@angular/core';
import { TxChannel } from '@sstepkiz';

@Component({
  selector: 'lib-rtc-channel',
  styleUrls: ['./channel.component.scss'],
  templateUrl: './channel.component.html'
})
export class ChannelComponent {

  /**
   * Sender Channel to represent.
   */
  @Input()
  channel: TxChannel;

  /**
   * Currently entered value to send.
   */
  value: string;

  /**
   * Closes the channel.
   */
  close(): void {
    this.channel.close();
  }

  /**
   * Sends the value through the channel.
   */
  send(): void {
    this.channel.send(JSON.parse(this.value));
  }
}
