import { AuthService } from '@libs/auth';
import { LoggerService } from '@libs/logger';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import {
  AuthType,
  CallAccept,
  CallDecline,
  CallOffer,
  CallResponse,
  CandidateOffer,
  ChannelRequest,
  ChannelType,
  ConnectionResponse,
  DEFAULT_AUTH_TIMEOUT,
  DescriptionOffer,
  DeviceType,
  HangupOffer,
  HangupReason,
  RegistrationResponse,
  SIGNALLING_ERROR_AUTHENTICATION,
  SIGNALLING_ERROR_INTERNAL,
  SIGNALLING_ERROR_INVALID_MODE,
  SIGNALLING_EVENT_CALL_ACCEPT,
  SIGNALLING_EVENT_CALL_ANSWER,
  SIGNALLING_EVENT_CALL_DECLINE,
  SIGNALLING_EVENT_CALL_OFFER,
  SIGNALLING_EVENT_CALL_REQUEST,
  SIGNALLING_EVENT_CALL_RESPONSE,
  SIGNALLING_EVENT_CANDIDATE_OFFER,
  SIGNALLING_EVENT_CHANNEL_REQUEST,
  SIGNALLING_EVENT_CONNECTION_RESPONSE,
  SIGNALLING_EVENT_DESCRIPTION_OFFER,
  SIGNALLING_EVENT_HANGUP_MESSAGE,
  SIGNALLING_EVENT_HANGUP_OFFER,
  SIGNALLING_EVENT_REGISTRATION_REQUEST,
  SIGNALLING_EVENT_REGISTRATION_RESPONSE,
  SIGNALLING_EVENT_USER_STATE,
  SignallingStatus,
  SignallingStatusOk,
  UserState,
} from '../../../../../../shared/dist';
import { validate } from 'class-validator';
import { Server, Socket } from 'socket.io';

import { CallAnswerDto } from '../dtos/call-answer.dto';
import { CallRequestDto } from '../dtos/call-request.dto';
import { CandidateOfferDto } from '../dtos/candidate-offer.dto';
import { ChannelRequestDto } from '../dtos/channel-request.dto';
import { ConnectionRequestDto } from '../dtos/connection-request.dto';
import { DescriptionOfferDto } from '../dtos/description-offer.dto';
import { HangupMessageDto } from '../dtos/hangup-message.dto';
import { RegistrationRequestDto } from '../dtos/registration-request.dto';
import { PermissionService } from '../services/permission/permission.service';
import { SocketService } from '../services/socket/socket.service';
import { UserService } from '../services/user/user.service';

@WebSocketGateway({ transports: ['websocket'] })
export class SignallingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  /**
   * The WebSocket server.
   */
  @WebSocketServer()
  private readonly server: Server;

  /**
   * Constructs a new signalling gateway.
   * @param authService Instance of auth service.
   * @param logger Instance of logging service.
   * @param permissionService Instance of permission service.
   * @param socketService Instance of socket service.
   * @param userService Instance of user service.
   */
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly permissionService: PermissionService,
    private readonly socketService: SocketService,
    private readonly userService: UserService,
  ) {}

  /**
   * Gets the required role to register in a mode.
   * @param mode Device type.
   */
  private getRequiredRole(mode: DeviceType): string {
    switch (mode) {
      case DeviceType.Monitor:
      case DeviceType.Sender:
        return 'USER';
      case DeviceType.Receiver:
        return 'MANAGER';
    }
  }

  /**
   * Gets the required scope to register in a mode.
   * @param mode Device type.
   */
  private getRequiredScope(mode: DeviceType): string {
    switch (mode) {
      case DeviceType.Monitor:
        return 'signalling_monitor';
      case DeviceType.Receiver:
        return 'signalling_receive';
      case DeviceType.Sender:
        return 'signalling_send';
    }
  }

  /**
   * Validates and forwards a received call answer.
   * @param client Socket that sent the call answer.
   * @param request Received call answer.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_CALL_ANSWER)
  @UsePipes(new ValidationPipe())
  async handleCallAnswer(
    client: any,
    request: CallAnswerDto,
  ): Promise<WsResponse<SignallingStatus>> {
    try {
      this.logger.debug(
        `Call answer received from socket "${client.id}": ${JSON.stringify(
          request,
        )}`,
      );
      // Get session by ID from database.
      const session = await this.socketService.getSessionById(
        request.sessionId,
        'monitor',
        'receiver',
        'sender',
      );
      // If one of the partners in the session is no more available, session will be deleted.
      // So if session is undefined, one of the partners no more available and session expired.
      if (!session) {
        this.logger.error(
          `Socket "${client.id}" tried to answer not existing session "${request.sessionId}"`,
          this.constructor.name,
        );
        throw 'Session expired';
      }
      // Only callee (= sender) is permitted to answer a call.
      if (session.sender.socketId !== client.id) {
        this.logger.warn(
          `Socket "${client.id}" tried to answer session "${JSON.stringify(
            session,
          )}" but is not permitted!`,
        );
        throw 'You are not permitted to accept the session';
      }
      // Eighter monitor or receiver should be set in session.
      if (!session.monitor && !session.receiver) {
        this.logger.error(
          `Session "${JSON.stringify(
            session,
          )}" has neighter a monitor nor a receiver`,
          this.constructor.name,
        );
        throw 'Internal server error';
      }
      // Get target socket id from session.
      const targetSocketId = session.monitor
        ? session.monitor.socketId
        : session.receiver.socketId;
      if (request.accepted) {
        this.logger.log(
          `Socket "${client.id}" accepted call of socket "${targetSocketId}" in session "${session.sessionId}"`,
          this.constructor.name,
        );
        // Send call acception.
        const callAccept: CallAccept = {
          sessionId: session.sessionId,
          socketId: client.id,
        };
        this.logger.debug(
          `Sending call accept message to socket "${targetSocketId}": ${JSON.stringify(
            callAccept,
          )}`,
          this.constructor.name,
        );
        this.server
          .to(targetSocketId)
          .emit(SIGNALLING_EVENT_CALL_ACCEPT, callAccept);
      } else {
        this.logger.debug(
          `User "${session.receiver.socketId}" on socket "${client.id}" declined call of user "${session.sender.socketId}" on socket "${targetSocketId}"`,
          this.constructor.name,
        );
        // Send call declinement.
        const callDecline: CallDecline = {
          sessionId: session.sessionId,
          socketId: client.id,
        };
        this.logger.debug(
          `Sending call decline message to socket "${targetSocketId}": ${JSON.stringify(
            callDecline,
          )}`,
          this.constructor.name,
        );
        this.server
          .to(targetSocketId)
          .emit(SIGNALLING_EVENT_CALL_DECLINE, callDecline);
      }
      const response: SignallingStatus = SignallingStatusOk;
      this.logger.debug(
        `Sending call answer response to socket "${client.id}"`,
        this.constructor.name,
      );
      return { event: 'ok', data: response };
    } catch (error) {
      this.logger.error(
        `Failed to redirect call answer of socket "${
          client.id
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
      throw error;
    }
  }

  /**
   * Validates and forwards a received call request.
   * @param client Socket that sent the call request.
   * @param request Received call request.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_CALL_REQUEST)
  @UsePipes(new ValidationPipe())
  async handleCallRequest(
    client: any,
    request: CallRequestDto,
  ): Promise<WsResponse<CallResponse>> {
    this.logger.debug(
      `Call request received from ${client.id}: ${JSON.stringify(request)}`,
      this.constructor.name,
    );
    try {
      // Get identity of calling user.
      const sourceUser = await this.socketService.getUserByMonitorIdOrReceiverId(
        client.id,
        request.mode,
      );
      if (!sourceUser) {
        this.logger.warn(
          `Unregistered socket "${client.id}" tried to call socket "${request.socketId}"`,
        );
        throw 'You are not registered as monitor or receiver';
      }
      // Validate permissions of calling user.
      const destinationUser = await this.socketService.getUserBySenderId(
        request.socketId,
      );
      let permitted = false;
      if (
        request.mode === DeviceType.Monitor &&
        sourceUser.userId === destinationUser.userId
      ) {
        permitted = true;
      } else {
        permitted = await this.permissionService.isUserPermittedToCallSender(
          sourceUser.userId,
          destinationUser.userId,
        );
      }
      if (!permitted) {
        this.logger.warn(
          `User "${sourceUser.userId}" on socket "${client.id}" tried to call user "${destinationUser.userId}" on socket "${request.socketId}" but is not permitted!"`,
        );
        throw 'You are not permitted to call the requested socket';
      }
      // Create new session.
      const session = await this.socketService.createSession(
        request.mode,
        client.id,
        request.socketId,
      );
      this.logger.log(
        `User "${sourceUser.userId}" on socket "${client.id}" requested call to user "${destinationUser.userId}" on socket "${request.socketId}". Session ID is "${session.sessionId}"`,
        this.constructor.name,
      );
      // Redirect call request as offer.
      const callOffer: CallOffer = {
        mode: request.mode,
        sessionId: session.sessionId,
        socketId: client.id,
        userId: sourceUser.userId,
      };
      this.logger.debug(
        `Sending call offer to ${request.socketId}: ${JSON.stringify(
          callOffer,
        )}`,
        this.constructor.name,
      );
      this.server
        .to(request.socketId)
        .emit(SIGNALLING_EVENT_CALL_OFFER, callOffer);
      // Send respond to caller with session id.
      const response: CallResponse = { sessionId: session.sessionId };
      this.logger.debug(
        `Responding to call request of socket "${client.id}": ${JSON.stringify(
          response,
        )}`,
        this.constructor.name,
      );
      return { event: SIGNALLING_EVENT_CALL_RESPONSE, data: response };
    } catch (error) {
      this.logger.error(
        `Failed to call sender with socket "${
          request.socketId
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
      throw error;
    }
  }

  /**
   * Validates and forwards a received ICE candidate offer.
   * @param client Socket that sent the candidate offer.
   * @param request Received ICE candidate offer.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_CANDIDATE_OFFER)
  @UsePipes(new ValidationPipe())
  async handleCandidateOffer(
    client: any,
    request: CandidateOfferDto,
  ): Promise<WsResponse<SignallingStatus>> {
    try {
      this.logger.debug(
        `Received ICE candidate offer from socket "${
          client.id
        }": ${JSON.stringify(request)}`,
        this.constructor.name,
      );
      const session = await this.socketService.getSessionById(
        request.sessionId,
        'monitor',
        'receiver',
        'sender',
      );
      if (!session) {
        this.logger.error(
          `Socket "${client.id}" tried to send an ICE candidate offer to socket "${request.socketId}" in not existing session "${request.sessionId}"`,
          this.constructor.name,
        );
        throw 'Session expired';
      }
      if (!session.monitor && !session.receiver) {
        this.logger.error(
          `Session "${JSON.stringify(
            session,
          )}" has neighter a monitor nor a receiver`,
          this.constructor.name,
        );
        throw 'Internal server error';
      }
      if (
        !session.hasSocket(client.id) ||
        !session.hasSocket(request.socketId)
      ) {
        this.logger.warn(
          `Unauthorized socket "${
            client.id
          }" tried to send ICE candidate to session "${JSON.stringify(
            session,
          )}": ${JSON.stringify(request)}`,
        );
        throw 'Unauthorized to send candidate';
      }
      if (client.id === request.socketId) {
        this.logger.error(
          `Socket "${client.id}" tried to send ICE candidate to it self`,
          this.constructor.name,
        );
        throw 'Invalid socket ID';
      }
      const message: CandidateOffer = {
        candidate: request.candidate,
        sessionId: session.sessionId,
        socketId: client.id,
      };
      this.logger.log(
        `Socket "${client.id}" sent ICE candidate to socket "${request.socketId}" in session "${request.sessionId}"`,
        this.constructor.name,
      );
      this.logger.debug(
        `Sending ICE candidate offer to socket "${
          request.socketId
        }": ${JSON.stringify(message)}`,
        this.constructor.name,
      );
      this.server
        .to(request.socketId)
        .emit(SIGNALLING_EVENT_CANDIDATE_OFFER, message);
      const response = SignallingStatusOk;
      this.logger.debug(
        `Sending ICE candidate offer response to socket "${
          client.id
        }": ${JSON.stringify(message)}`,
        this.constructor.name,
      );
      return { event: 'ok', data: response };
    } catch (error) {
      this.logger.error(
        `Failed to redirect candidate offer of socket "${
          client.id
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
      throw error;
    }
  }

  /**
   * Validates and forwards a received channel request.
   * @param client Socket that sent the channel request.
   * @param request Received channel request.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_CHANNEL_REQUEST)
  @UsePipes(new ValidationPipe())
  async handleChannelRequest(
    client: any,
    request: ChannelRequestDto,
  ): Promise<WsResponse<SignallingStatus>> {
    try {
      this.logger.debug(
        `Received channel request from socket "${client.id}": ${JSON.stringify(
          request,
        )}`,
        this.constructor.name,
      );
      const session = await this.socketService.getSessionById(
        request.sessionId,
        'monitor',
        'receiver',
        'sender',
      );
      if (!session) {
        this.logger.error(
          `Socket "${client.id}" tried to send channel request to socket "${request.socketId}" in not existing session "${request.sessionId}"`,
          this.constructor.name,
        );
        throw 'Session expired';
      }
      if (!session.monitor && !session.receiver) {
        this.logger.error(
          `Session "${JSON.stringify(
            session,
          )}" has neighter a monitor nor a receiver`,
          this.constructor.name,
        );
        throw 'Internal server error';
      }
      try {
        if (session.sender.socketId !== request.socketId) {
          throw 'Sender has not requested socket ID';
        } else if (session.monitor && session.monitor.socketId === client.id) {
          // Client is monitor.
          const t = [ChannelType.monitoring];
          if (JSON.stringify(request.types) !== JSON.stringify(t)) {
            throw 'Monitor is only permitted to monitor';
          }
        } else if (
          session.receiver &&
          session.receiver.socketId === client.id
        ) {
          // Client is receiver.
          const [subject, target] = await Promise.all([
            this.socketService.getSenderById(session.sender.socketId, 'user'),
            this.socketService.getReceiverById(
              session.receiver.socketId,
              'user',
            ),
          ]);
          if (
            !(await this.permissionService.isUserPermitted(
              subject.user.userId,
              target.user.userId,
              ...request.types,
            ))
          ) {
            throw 'User is not permitted';
          }
        }
      } catch {
        this.logger.warn(
          `Unauthorized socket "${
            client.id
          }" tried to send channel request to session "${JSON.stringify(
            session,
          )}": ${JSON.stringify(request)}`,
        );
        throw 'Unauthorized to request channel of requested type';
      }
      const message: ChannelRequest = {
        types: request.types,
        sessionId: session.sessionId,
        socketId: client.id,
      };
      this.logger.log(
        `Socket "${client.id}" sent channel request to socket "${request.socketId}" in session "${request.sessionId}"`,
        this.constructor.name,
      );
      this.logger.debug(
        `Sending channel request to socket "${
          request.socketId
        }": ${JSON.stringify(message)}`,
        this.constructor.name,
      );
      this.server
        .to(request.socketId)
        .emit(SIGNALLING_EVENT_CHANNEL_REQUEST, message);
      const response = SignallingStatusOk;
      this.logger.debug(
        `Sending channel request response to socket "${
          client.id
        }": ${JSON.stringify(message)}`,
        this.constructor.name,
      );
      return { event: 'ok', data: response };
    } catch (error) {
      this.logger.error(
        `Failed to redirect channel request of socket "${
          client.id
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
      throw error;
    }
  }

  /**
   * Handles a new WebSocket connection.
   * @param socket Instance of newly connected socket.
   */
  async handleConnection(socket: Socket): Promise<void> {
    const forwardAddress = socket.handshake.headers['x-forwarded-for'];
    if (forwardAddress) {
      // Log address of real client, not proxy.
      this.logger.log(
        `New connection from socket "${socket.id}" with IP address "${forwardAddress}"`,
        this.constructor.name,
      );
    } else {
      // Log address of requesting client.
      this.logger.log(
        `New connection from socket "${socket.id}" with IP address "${socket.handshake.address}"`,
        this.constructor.name,
      );
    }
    // Validate mode.
    const query = new ConnectionRequestDto();
    query.mode = socket.handshake.query.mode as DeviceType;
    if (!query.mode || (await validate(query)).length > 0) {
      // Send error message and disconnect.
      socket._error(SIGNALLING_ERROR_INVALID_MODE);
      socket.disconnect(true);
      return;
    }
    // Set authentication timeout.
    setTimeout(async () => {
      // If socket is not connected, ensure that connection is closed.
      if (!socket.connected) socket.disconnect(true);
      // Tries to get the device from database.
      const device = await this.socketService.getSocketByIdAndMode(
        socket.id,
        query.mode,
      );
      // Ensure, that device is already registered.
      if (device) return;
      // Emit error and disconnect from device due to missing authentication.
      socket._error(SIGNALLING_ERROR_AUTHENTICATION);
      socket.disconnect(true);
    }, DEFAULT_AUTH_TIMEOUT);
    // Send connection response.
    const response: ConnectionResponse = { authTypes: [AuthType.oauth] };
    socket.emit(SIGNALLING_EVENT_CONNECTION_RESPONSE, response);
  }

  /**
   * Validates and forwards received session description offer.
   * @param client Socket that sent the candidate offer.
   * @param request Received session description offer.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_DESCRIPTION_OFFER)
  @UsePipes(new ValidationPipe())
  async handleDescriptionOffer(
    client: any,
    request: DescriptionOfferDto,
  ): Promise<WsResponse<SignallingStatus>> {
    try {
      const session = await this.socketService.getSessionById(
        request.sessionId,
        'monitor',
        'receiver',
        'sender',
      );
      if (!session) {
        this.logger.error(
          `Socket "${client.id}" failed to send session description to socket "${request.socketId}" in not existing session "${request.sessionId}"`,
          this.constructor.name,
        );
        throw 'Session expired';
      }
      if (!session.monitor && !session.receiver) {
        this.logger.error(
          `Session "${JSON.stringify(
            session,
          )}" has neighter a monitor nor a receiver`,
          this.constructor.name,
        );
        throw 'Internal server error';
      }
      if (
        !session.hasSocket(client.id) ||
        !session.hasSocket(request.socketId)
      ) {
        this.logger.warn(
          `Unauthorized socket "${
            client.id
          }" tried to send session description to session "${JSON.stringify(
            session,
          )}": ${JSON.stringify(request)}`,
        );
        throw 'Unauthorized to send description';
      }
      if (client.id === request.socketId) {
        this.logger.error(
          `Socket "${client.id}" tried to send session description to it self`,
          this.constructor.name,
        );
        throw 'Invalid socket ID';
      }
      const message: DescriptionOffer = {
        description: request.description,
        sessionId: session.sessionId,
        socketId: client.id,
      };
      this.logger.log(
        `Socket "${client.id}" sent session description to socket "${request.socketId}" in session "${request.sessionId}"`,
        this.constructor.name,
      );
      this.logger.debug(
        `Sending description offer to socket "${
          request.socketId
        }": ${JSON.stringify(message)}`,
        this.constructor.name,
      );
      this.server
        .to(request.socketId)
        .emit(SIGNALLING_EVENT_DESCRIPTION_OFFER, message);
      const response = { status: 'ok' };
      this.logger.debug(
        `Sending description offer response to socket "${
          client.id
        }": ${JSON.stringify(response)}`,
        this.constructor.name,
      );
      return { event: 'ok', data: response };
    } catch (error) {
      this.logger.error(
        `Failed to redirect description offer of socket "${
          client.id
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
      throw error;
    }
  }

  /**
   * Handles dosconnect of a WebSocket client.
   * @param client Instance of disconnected socket.
   */
  handleDisconnect(client: any) {
    this.logger.log(
      `Socket "${client.id}" disconnected`,
      this.constructor.name,
    );
  }

  /**
   * Validates and forwards received hangup messages to clients in a session.
   * @param client Socket that sent the hangup message.
   * @param request Received hangup message.
   * @returns Status response for client.
   */
  @SubscribeMessage(SIGNALLING_EVENT_HANGUP_MESSAGE)
  @UsePipes(new ValidationPipe())
  async handleHangupMessage(
    client: any,
    request: HangupMessageDto,
  ): Promise<WsResponse<SignallingStatus>> {
    try {
      const session = await this.socketService.getSessionById(
        request.sessionId,
        'monitor',
        'receiver',
        'sender',
      );
      if (!session) {
        this.logger.error(
          `Socket "${client.id}" failed to send hangup message to not existing session "${request.sessionId}"`,
          this.constructor.name,
        );
        throw 'Session expired';
      }
      if (!session.monitor && !session.receiver) {
        this.logger.error(
          `Session "${JSON.stringify(
            session,
          )}" has neighter a monitor nor a receiver`,
          this.constructor.name,
        );
        throw 'Internal server error';
      }
      if (!session.hasSocket(client.id)) {
        this.logger.warn(
          `Unauthorized socket "${
            client.id
          }" tried to send session description to session "${JSON.stringify(
            session,
          )}": ${JSON.stringify(request)}`,
        );
        throw 'Unauthorized to send description';
      }
      this.logger.log(
        `Socket "${client.id}" sent hangup message to session "${request.sessionId}"`,
        this.constructor.name,
      );
      this.logger.debug(
        `Closing session "${request.sessionId}" due to hangup message of socket "${client.id}"`,
      );
      await this.socketService.removeSession(session);
      const targets = [
        session.getMonitorOrReceiverId(),
        session.sender.socketId,
      ].filter(s => s !== client.id);
      const message: HangupOffer = {
        reason: HangupReason.hangup,
        sessionId: request.sessionId,
        socketId: client.id,
      };
      targets.forEach(t => {
        this.logger.debug(
          `Sending hangup offer to socket "${t}": ${JSON.stringify(message)}`,
          this.constructor.name,
        );
        this.server.to(t).emit(SIGNALLING_EVENT_HANGUP_OFFER, message);
      });
      const response = { status: 'ok' };
      this.logger.debug(
        `Sending hangup message response to socket "${
          client.id
        }": ${JSON.stringify(response)}`,
        this.constructor.name,
      );
      return { event: 'ok', data: response };
    } catch (error) {
      this.logger.error(
        `Failed to hangup call of socket "${client.id}" in session "${
          request.sessionId
        }": ${JSON.stringify(error)}`,
        this.constructor.name,
      );
    }
  }

  /**
   * Validates registration request and tries to authenticate socket.
   * @param socket Socket that sent the registration request.
   * @param request Received registration request.
   */
  @SubscribeMessage(SIGNALLING_EVENT_REGISTRATION_REQUEST)
  @UsePipes(new ValidationPipe())
  async handleRegistrationRequest(
    socket: Socket,
    request: RegistrationRequestDto,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Authenticating socket "${socket.id}" with request "${JSON.stringify(
          request,
        )}"`,
        this.constructor.name,
      );
      // Verify token and extract user ID.
      const token = await this.authService.verifyToken(request.accessToken);
      const tokenPayload = token.payload;
      // const verifiedToken = await this.authService.verifyToken(
      //   request.accessToken,
      // );
      // const tokenPayload = this.authService.parseJwtPayload(verifiedToken);
      const userId = tokenPayload.preferred_username as string;
      const scope: string[] = (tokenPayload.scope as string).split(' ') || [];
      const roles: string[] = tokenPayload.realm_access ? tokenPayload.realm_access['roles'] as string[] : [];
      // Register the socket and respond to connection request.
      try {
        const mode: DeviceType = socket.handshake.query.mode as DeviceType;
        const requiredScope = this.getRequiredScope(mode);
        const requiredRole = this.getRequiredRole(mode);
        if (scope.indexOf(requiredScope) < 0 || roles.indexOf(requiredRole) < 0)
          throw `Not permitted to register as ${mode.toString()}`;
        // Register the socket.
        const response = await this.registerSocket(socket.id, userId, mode);
        this.logger.log(
          `Socket "${
            socket.id
          }" authenticated as user "${userId}" in mode "${mode.toString()}"`,
          this.constructor.name,
        );
        // Subscribe to disconnection of socket.
        socket.on('disconnect', () =>
          this.unregisterSocket(socket.id, userId, socket.handshake.query.mode as DeviceType),
        );
        // Send registration response to socket.
        socket.emit(SIGNALLING_EVENT_REGISTRATION_RESPONSE, response);
      } catch (error) {
        this.logger.warn(
          `Failed to register socket "${socket.id}" with access token "${
            request.accessToken
          }": ${error}`,
        );
        throw SIGNALLING_ERROR_INTERNAL;
      }
    } catch (error) {
      // Send error message and diconnect socket.
      socket._error(error);
      socket.disconnect(true);
    }
  }

  /**
   * Registers a socket, informs related monitors and receivers and generates a response.
   * @param socketId Identity of socket.
   * @param userId Identity of user.
   * @param mode Mode of socket.
   * @returns Generated registration response.
   */
  private async registerSocket(
    socketId: string,
    userId: string,
    mode: DeviceType,
  ): Promise<RegistrationResponse> {
    this.logger.debug(
      `Registering socket "${socketId}"`,
      this.constructor.name,
    );
    // Register socket in database.
    await this.socketService.registerSocket(socketId, userId, mode);
    // Generate response depending on requested mode.
    const response: RegistrationResponse = { socketId: socketId };
    switch (mode) {
      case DeviceType.Monitor:
        const senders = (await this.userService.getUserById(userId, 'senders'))
          .senders;
        response.senders = { [userId]: senders.map(s => s.socketId) };
        break;
      case DeviceType.Receiver:
        response.senders = await this.socketService.getSendersOf(userId);
        break;
      case DeviceType.Sender:
        await Promise.all([
          this.sendStateToMonitors(socketId, userId, true),
          this.sendStateToReceivers(socketId, userId, true),
        ]);
        break;
      default:
        // Should never happen.
        throw `Invalid mode "${mode}"`;
    }
    return response;
  }

  /**
   * Sends updated availability state of a socket to all monitors that are permitted to listen to it.
   * @param socketId Identity of socket.
   * @param userId Identity of user.
   * @param available If socket is available.
   */
  private async sendStateToMonitors(
    socketId: string,
    userId: string,
    available: boolean,
  ): Promise<void> {
    // Gets all monitors that are permitted to receive data fron the socket.
    const monitors = await this.socketService.getMonitorsOf(userId);
    // Sends updated status to all monitors.
    monitors.forEach(socket => {
      const state: UserState = { available, socketId, userId };
      this.server.to(socket.socketId).emit(SIGNALLING_EVENT_USER_STATE, state);
    });
  }

  /**
   * Sends updated availability state of a socket to all receivers that are permitted to listen to it.
   * @param socketId Identity of socket.
   * @param userId Identity of user.
   * @param available If socket is available.
   */
  private async sendStateToReceivers(
    socketId: string,
    userId: string,
    available: boolean,
  ): Promise<void> {
    // Gets all receivers that are permitted to receive data from the socket.
    const receivers = await this.socketService.getReceiversOf(userId);
    // Sends updated status to all receivers.
    receivers.forEach(socket => {
      const state: UserState = { available, socketId, userId };
      this.server.to(socket.socketId).emit(SIGNALLING_EVENT_USER_STATE, state);
    });
  }

  /**
   * Unregisters a socket and informs related monitors and receivers.
   * @param socketId Identity of socket.
   * @param userId Identity of user.
   * @param mode Device type.
   */
  private async unregisterSocket(
    socketId: string,
    userId: string,
    mode: DeviceType,
  ): Promise<void> {
    // Find all active sessions of socket.
    const sessions = await this.socketService.getActiveSessions(
      socketId,
      'monitor',
      'receiver',
      'sender',
    );
    if (sessions.length > 0) {
      // Hangup all sessions.
      sessions.forEach(s => {
        const sId =
          s.sender.socketId === socketId
            ? s.getMonitorOrReceiverId()
            : s.sender.socketId;
        const message: HangupOffer = {
          reason: HangupReason.disconnect,
          sessionId: s.sessionId,
          socketId,
        };
        this.logger.log(
          `Hanging up session "${s.sessionId}" of socket "${sId}" and socket "${socketId}" due to disconnect of socket "${socketId}"`,
        );
        this.logger.debug(
          `Sending hangup offer to socket "${sId}" due to disconnect of socket "${socketId}" and session "${
            s.sessionId
          }: ${JSON.stringify(message)}`,
          this.constructor.name,
        );
        this.server.to(sId).emit(SIGNALLING_EVENT_HANGUP_OFFER, message);
      });
    }
    // Create promise that unregisters socket from database.
    const promises = [this.socketService.unregisterSocket(socketId, mode)];
    if (mode === DeviceType.Sender) {
      // Create promises that send updated state to monitors and receivers.
      promises.push(this.sendStateToMonitors(socketId, userId, false));
      promises.push(this.sendStateToReceivers(socketId, userId, false));
    }
    // Wait until all promises are resolved.
    await Promise.all(promises);
  }
}
