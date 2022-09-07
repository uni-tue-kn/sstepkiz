import { UserDescription } from '@sstepkiz';
import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Monitor } from './monitor.entity';
import { Permissions } from './permissions.entity';
import { Receiver } from './receiver.entity';
import { Sender } from './sender.entity';

@Entity()
export class User {
  /**
   * Monitor sockets.
   */
  @OneToMany(
    type => Monitor,
    monitor => monitor.user,
  )
  monitors: Monitor[];

  /**
   * Permissions the user has granted to other users.
   */
  @OneToMany(
    type => Permissions,
    permissions => permissions.target,
  )
  permits: Permissions[];

  /**
   * Permissions the user is granted by other users.
   */
  @OneToMany(
    type => Permissions,
    permissions => permissions.subject,
  )
  permittedBy: Permissions[];

  /**
   * Receiver sockets.
   */
  @OneToMany(
    type => Receiver,
    receiver => receiver.user,
  )
  receivers: Receiver[];

  /**
   * Sender sockets.
   */
  @OneToMany(
    type => Sender,
    sender => sender.user,
  )
  senders: Sender[];

  /**
   * Username from SSO.
   */
  @PrimaryColumn({ length: 255, type: 'varchar' })
  userId: string;

  /**
   * Constructs a new user.
   * @param userId Optional identity of user.
   */
  constructor(userId?: string) {
    if (userId) this.userId = userId;
  }

  /**
   * Gets a description of the user.
   * @returns Description of user.
   */
  getDescription(): UserDescription {
    return {
      userId: this.userId,
    };
  }
}
