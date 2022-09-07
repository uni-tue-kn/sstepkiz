import { Entity, ManyToOne, PrimaryColumn, OneToMany } from 'typeorm';

import { User } from './user.entity';
import { Session } from './session.entity';

@Entity()
export class Sender {
  /**
   * Associated sessions.
   */
  @OneToMany(
    type => Session,
    session => session.sender,
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
    user => user.senders,
    { onDelete: 'CASCADE' },
  )
  user: User;

  /**
   * Constructs a new sender.
   * @param socketId Optionsl identity of socket.
   * @param user Optional associated user.
   */
  constructor(socketId?: string, user?: User) {
    if (socketId) this.socketId = socketId;
    if (user) this.user = user;
  }
}
