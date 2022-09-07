import { Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { Session } from './session.entity';
import { User } from './user.entity';

@Entity()
export class Receiver {
  /**
   * Related sessions.
   */
  @OneToMany(
    type => Session,
    session => session.receiver,
  )
  sessions: Session[];

  /**
   * Identity of connected socket.
   */
  @PrimaryColumn({ length: 20, type: 'char' })
  socketId: string;

  /**
   * Associated user.
   */
  @ManyToOne(
    type => User,
    user => user.receivers,
    { onDelete: 'CASCADE' },
  )
  user: User;

  /**
   * Constructs a new receiver.
   * @param socketId Optional identity of socket.
   * @param user Optional associated user.
   */
  constructor(socketId?: string, user?: User) {
    if (socketId) this.socketId = socketId;
    if (user) this.user = user;
  }
}
