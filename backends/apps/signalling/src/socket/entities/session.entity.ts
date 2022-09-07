import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Monitor } from './monitor.entity';
import { Receiver } from './receiver.entity';
import { Sender } from './sender.entity';

@Entity()
export class Session {
  /**
   * Related monitor.
   */
  @ManyToOne(
    type => Monitor,
    monitor => monitor.sessions,
    { nullable: true, onDelete: 'CASCADE' },
  )
  monitor?: Monitor;

  /**
   * Related receiver.
   */
  @ManyToOne(
    type => Receiver,
    receiver => receiver.sessions,
    { nullable: true, onDelete: 'CASCADE' },
  )
  receiver?: Receiver;

  /**
   * Related sender.
   */
  @ManyToOne(
    type => Sender,
    sender => sender.sessions,
    { onDelete: 'CASCADE' },
  )
  sender: Sender;

  /**
   * Universally unique identity of the session.
   */
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  /**
   * Gets the socket identity of the monitor or receiver, depending on which exists.
   * @returns Identity monitor's or receiver's socket.
   */
  getMonitorOrReceiverId(): string {
    return this.monitor?.socketId || this.receiver?.socketId;
  }

  /**
   * Checks, if monitor, receiver or sender has a specified socket identity.
   * @param socketId Identity of socket to search.
   * @returns true, if so; true, if not.
   */
  hasSocket(socketId: string): boolean {
    return [this.getMonitorOrReceiverId(), this.sender.socketId].includes(
      socketId,
    );
  }
}
