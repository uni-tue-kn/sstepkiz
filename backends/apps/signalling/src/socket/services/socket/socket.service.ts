import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeviceType,
  SenderDescription,
} from '../../../../../../../shared/dist';
import { Repository } from 'typeorm';

import { Monitor } from '../../entities/monitor.entity';
import { Receiver } from '../../entities/receiver.entity';
import { Sender } from '../../entities/sender.entity';
import { Session } from '../../entities/session.entity';
import { PermissionService } from '../permission/permission.service';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class SocketService {
  /**
   * Constructs a new user service.
   * @param monitorRepository Instance of monitor repository.
   * @param receiverRepository Instance of receiver repository.
   * @param permissionService Instance of permission service.
   * @param senderRepository Instance of sender repository.
   * @param sessionRepository Instance of session repository.
   * @param userService Instance of user service.
   */
  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
    private readonly permissionService: PermissionService,
    @InjectRepository(Sender)
    private readonly senderRepository: Repository<Sender>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {
    this.cleanupDatabase();
  }

  /**
   * Cleans up monitors, receivers, senders and sessions.
   */
  private async cleanupDatabase(): Promise<void> {
    await Promise.all([
      await this.monitorRepository.delete({}),
      await this.receiverRepository.delete({}),
      await this.senderRepository.delete({}),
      // Sessions will be cleaned up by ON DELETE constraints.
    ]);
  }

  /**
   * Creates a new session in database.
   * @param mode Mode of session.
   * @param callerSocketId Identity of monitor or receiver socket that initiated the session.
   * @param calleeSocketId Identity of sender socket that is called.
   * @returns Created session as object.
   */
  async createSession(
    mode: DeviceType.Monitor | DeviceType.Receiver,
    callerSocketId: string,
    calleeSocketId: string,
  ): Promise<Session> {
    const session = new Session();
    session.sender = await this.senderRepository.findOneBy({ socketId: calleeSocketId });
    switch (mode) {
      case DeviceType.Monitor:
        session.monitor = await this.monitorRepository.findOneBy({ socketId: callerSocketId });
        break;
      case DeviceType.Receiver:
        session.receiver = await this.receiverRepository.findOneBy(
          { socketId: callerSocketId },
        );
        break;
    }
    return await this.sessionRepository.save(session);
  }

  /**
   * Gets all active sessions of a socket by its identity.
   * @param socketId Identity of session.
   * @param relations Optional relations of session to get.
   * @returns All active sessions.
   */
  async getActiveSessions(
    socketId: string,
    ...relations: string[]
  ): Promise<Session[]> {
    const sockets = await Promise.all([
      this.sessionRepository.find({
        where: { sender: { socketId } },
        relations,
      }),
      this.sessionRepository.find({
        where: { receiver: { socketId } },
        relations,
      }),
      this.sessionRepository.find({
        where: { monitor: { socketId } },
        relations,
      }),
    ]);
    const sessions = [...sockets[0], ...sockets[1], ...sockets[2]];
    return sessions;
  }

  /**
   * Gets a monitor by its socket identity.
   * @param socketId Identity of socket.
   * @param relations Optional relations of monitor to get.
   * @returns Found monitor or undefined if not found.
   */
  async getMonitorById(
    socketId: string,
    ...relations: string[]
  ): Promise<Monitor> {
    return await this.monitorRepository.findOne({
      where: {socketId},
      relations
    });
  }

  /**
   * Gets all monitors of a user.
   * @param userId Identity of user.
   * @param relations Optional relations of monitor to get.
   * @returns Found monitors of the user.
   */
  async getMonitorsOf(
    userId: string,
    ...relations: string[]
  ): Promise<Monitor[]> {
    return await this.monitorRepository.find({
      relations,
      where: { user: { userId } },
    });
  }

  /**
   * Gets a receiver by its socket identity.
   * @param socketId Identity of socket.
   * @param relations Optional relations of receiver to get.
   * @returns Found receiver or undefined if not found.
   */
  async getReceiverById(
    socketId: string,
    ...relations: string[]
  ): Promise<Receiver> {
    return await this.receiverRepository.findOne({
      where: {socketId},
      relations
    });
  }

  /**
   * Gets all receivers that a user is permitted to communicate with.
   * @param userId Identity of user.
   * @returns Found receivers.
   */
  async getReceiversOf(userId: string): Promise<Receiver[]> {
    // Get permissions.
    const therapistIds = (
      await this.permissionService.getPermittedTargetsOf(userId)
    ).map(t => t.userId);
    if (therapistIds.length === 0) return [];

    // Get receivers.
    const receivers = [];
    await Promise.all(
      therapistIds.map(async id => {
        const user = await this.userService.getUserById(id, 'receivers');
        receivers.push(...user.receivers);
      }),
    );
    return receivers;
  }

  /**
   * Gets a sender by its socket identity.
   * @param socketId Identity of socket.
   * @param relations Optional relations of sender to get.
   * @returns Found sender or undefined if not found.
   */
  async getSenderById(
    socketId: string,
    ...relations: string[]
  ): Promise<Sender> {
    return await this.senderRepository.findOne({
      where: {socketId},
      relations
    });
  }

  /**
   * Gets a description of senders that a user is permitted to communicate with.
   * @param userId Identity of user.
   * @returns Description of senders.
   */
  async getSendersOf(userId: string): Promise<SenderDescription> {
    // Get user with permissions about the user.
    const patientIds = await this.permissionService.getPermittedSubjectIds(
      userId,
    );
    if (patientIds.length === 0) return {};

    const patients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.userId IN (:...ids)', { ids: patientIds })
      .leftJoinAndSelect('user.senders', 'sender')
      .getMany();

    const senders: SenderDescription = {};
    patients.forEach(u => {
      senders[u.userId] = u.senders.map(s => s.socketId);
    });
    return senders;
  }

  /**
   * Gets a session by its identity.
   * @param sessionId Identity of session.
   * @param relations Optional relations of session to get.
   * @returns Found session or undefined if not found.
   */
  async getSessionById(
    sessionId: string,
    ...relations: string[]
  ): Promise<Session> {
    const session = this.sessionRepository.findOne({
      where: { sessionId: sessionId },
      relations
    });
    return session;
  }

  /**
   *
   * @param socketId Identity of socket.
   * @param mode Device mode.
   * @param relations Optional relations of session to get.
   * @returns Found monitor, receiver or sender or undefined if not found.
   */
  async getSocketByIdAndMode(
    socketId: string,
    mode: DeviceType,
    ...relations: string[]
  ): Promise<Monitor | Receiver | Sender> {
    switch (mode) {
      case DeviceType.Monitor:
        return await this.getMonitorById(socketId, ...relations);
      case DeviceType.Receiver:
        return await this.getReceiverById(socketId, ...relations);
      case DeviceType.Sender:
        return await this.getSenderById(socketId, ...relations);
    }
  }

  /**
   * Gets a user by the socket identity of one of its monitors.
   * @param socketId Identity of monitor socket.
   * @param relations Relations of user to get.
   * @returns Found user or undefined if not found.
   */
  private async getUserByMonitorId(
    socketId: string,
    ...relations: string[]
  ): Promise<User> {
    const userRelations = relations.map(r => 'user.' + r);
    const monitor = await this.getMonitorById(
      socketId,
      'user',
      ...userRelations,
    );
    return monitor ? monitor.user : undefined;
  }

  /**
   * Gets a user by identity of monitor or receiver.
   * @param socketId Identity of socket.
   * @param mode Monitor or receiver mode.
   * @param relations Optional relations.
   * @returns Found user or undefined if not found.
   */
  async getUserByMonitorIdOrReceiverId(
    socketId: string,
    mode: DeviceType,
    ...relations: string[]
  ): Promise<User> {
    switch (mode) {
      case DeviceType.Monitor:
        return await this.getUserByMonitorId(socketId, ...relations);
      case DeviceType.Receiver:
        return await this.getUserByReceiverId(socketId, ...relations);
      default:
        throw 'Invalid mode';
    }
  }

  /**
   * Gets a user by the socket identity of one of its receivers.
   * @param socketId Identity of receiver socket.
   * @param relations Relations of user to get.
   * @returns Found user or undefined if not found.
   */
  private async getUserByReceiverId(
    socketId: string,
    ...relations: string[]
  ): Promise<User> {
    const userRelations = relations.map(r => 'user.' + r);
    const receiver = await this.getReceiverById(
      socketId,
      'user',
      ...userRelations,
    );
    return receiver ? receiver.user : undefined;
  }

  /**
   * Gets a user by the socket identity of one of its senders.
   * @param socketId Identity of socket.
   * @returns Found user or undefined if not found.
   */
  async getUserBySenderId(
    socketId: string,
    ...relations: string[]
  ): Promise<User> {
    const userRelations = relations.map(r => 'user.' + r);
    const sender = await this.getSenderById(socketId, 'user', ...userRelations);
    return sender ? sender.user : undefined;
  }
  /**
   * Registers a socket in database.
   * @param socketId Identity of socket.
   * @param userId Identity of user.
   * @param mode Mode of socket.
   */
  async registerSocket(
    socketId: string,
    userId: string,
    mode: DeviceType,
  ): Promise<void> {
    const user = await this.userService.getUserById(userId);
    switch (mode) {
      case DeviceType.Monitor:
        await this.monitorRepository.save(new Monitor(socketId, user));
        break;
      case DeviceType.Receiver:
        await this.receiverRepository.save(new Receiver(socketId, user));
        break;
      case DeviceType.Sender:
        await this.senderRepository.save(new Sender(socketId, user));
        break;
      default:
        throw `Invalid mode "${mode}"`;
    }
  }

  /**
   * Removes a session from database.
   * @param session Session to remove.
   */
  async removeSession(session: Session): Promise<void> {
    await this.sessionRepository.remove(session);
  }

  /**
   * Unregisters a socket from database.
   * @param socketId Identity of socket.
   * @param mode Mode of socket.
   */
  async unregisterSocket(socketId: string, mode: DeviceType): Promise<void> {
    switch (mode) {
      case DeviceType.Monitor:
        await this.monitorRepository.delete({ socketId });
        break;
      case DeviceType.Receiver:
        await this.receiverRepository.delete({ socketId });
        break;
      case DeviceType.Sender:
        await this.senderRepository.delete({ socketId });
        break;
      default:
        throw `Invalid mode "${mode}"`;
    }
  }
}
