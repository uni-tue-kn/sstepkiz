import { LoggerService } from '@libs/logger';
import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Put, Request } from '@nestjs/common';

import { IdParameterDto } from '../../dtos/id-parameter.dto';
import { LocalPeerService } from '../../services/local-peer/local-peer.service';

@Controller('peer')
export class RtcConnectController {
  /**
   * Constructs a new Controller for a local peer connection.
   * @param localPeerService Local peer service instance.
   * @param loggerService Logger service instance.
   */
  constructor(
    private readonly localPeerService: LocalPeerService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Requests the ID of a new local peer.
   * @param request HTTP request.
   * @returns Identity of local peer.
   */
  @Get()
  openNewPeer(@Request() request: any): { id: string } {
    this.loggerService.verbose(
      'Request for new local peer received',
      this.constructor.name,
    );
    try {
      const id = this.localPeerService.openNewPeer();
      this.loggerService.warn(
        `New local peer created with ID "${id}" from IP address "${request.ip ||
          request.connection.remoteAddress ||
          'unknown'}"`,
        this.constructor.name,
      );
      return { id };
    } catch (error) {
      this.loggerService.error(
        `Failed to create new local peer`,
        this.constructor.name,
      );
      throw new InternalServerErrorException(undefined, error);
    }
  }

  // /**
  //  * Receives an ICE candidate for a local peer.
  //  * @param id Identity of local peer.
  //  * @param candidate Received ICE candidate.
  //  * @param request HTTP request.
  //  */
  // @Put(':id/candidate')
  // async setCandidate(
  //   @Param() params: IdParameterDto,
  //   @Body() candidate: RTCIceCandidateInit,
  //   @Request() request: any,
  // ): Promise<void> {
  //   if (!this.localPeerService.existsPeer(params.id)) {
  //     this.loggerService.warn(
  //       `ICE candidate request for invalid peer ID "${
  //         params.id
  //       }" from IP address "${request.ip ||
  //         request.connection.remoteAddress ||
  //         'unknown'}"`,
  //       this.constructor.name,
  //     );
  //     throw new NotFoundException(undefined, 'Peer ID not found');
  //   }
  //   try {
  //     await this.localPeerService.setCandidate(params.id, candidate);
  //   } catch (error) {
  //     this.loggerService.error(
  //       `Failed to set ICE candidate of local peer with ID "${
  //         params.id
  //       }" to "${JSON.stringify(candidate)}": ${error}`,
  //       this.constructor.name,
  //     );
  //     throw new BadRequestException(undefined, error);
  //   }
  // }

  /**
   * Receives a session description offer.
   * @param id Identity of local peer.
   * @param description Received session description.
   * @param request HTTP request.
   * @returns Answer to session description.
   */
  @Put(':id/description')
  async setOffer(
    @Param() params: IdParameterDto,
    @Body() description: RTCSessionDescriptionInit,
    @Request() request: any,
  ): Promise<RTCSessionDescriptionInit> {
    if (!this.localPeerService.existsPeer(params.id)) {
      this.loggerService.warn(
        `Session description request for invalid peer ID "${
          params.id
        }" from IP address "${request.ip ||
          request.connection.remoteAddress ||
          'unknown'}"`,
        this.constructor.name,
      );
      throw new NotFoundException(undefined, 'Peer ID not found');
    }
    try {
      return await this.localPeerService.setDescription(params.id, description);
    } catch (error) {
      this.loggerService.error(
        `Failed to set session description of local peer peer with ID "${
          params.id
        }" to "${JSON.stringify(description)}": ${error}`,
        this.constructor.name,
      );
      throw new BadRequestException(undefined, error);
    }
  }
}
