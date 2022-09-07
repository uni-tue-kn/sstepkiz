import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChannelType,
  PermissionDescription,
} from '../../../../../../../shared/dist';
import { Repository } from 'typeorm';

import { Permissions } from '../../entities/permissions.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class PermissionService {
  /**
   * Constructs a new permission service.
   * @param permissionsRepository Instance of permission repository.
   */
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates new permissions existing permissions.
   * @param description Description of permissions.
   * @returns New stored permissions.
   */
  async createPermissions(
    description: PermissionDescription,
  ): Promise<Permissions> {
    // Find existing permissions if they exist.
    const newPermissions = new Permissions();
    newPermissions.ecg = description.ecg ?? false;
    newPermissions.eda = description.eda ?? false;
    newPermissions.eyetracking = description.eyetracking ?? false;
    newPermissions.movement = description.movement ?? false;
    const users = await Promise.all([
      this.userRepository.findOneBy({ userId: description.subjectId }),
      this.userRepository.findOneBy({userId: description.targetId }),
    ]);
    newPermissions.subject = users[0];
    newPermissions.target = users[1];
    return await this.permissionsRepository.save(newPermissions);
  }

  /**
   * Gets descriptions of all permissions.
   * @param relations Relations to get.
   * @returns Descriptions of all permissions.
   */
  async getPermissions(
    ...relations: string[]
  ): Promise<PermissionDescription[]> {
    const permissions = await this.permissionsRepository.find({ relations });
    const descriptions = permissions.map(p => p.getDescription());
    return descriptions;
  }

  /**
   * Gets identities of users (patients) that a user (therapist) is permitted for.
   * @param userId Identity of user (therapist).
   * @returns Identities of users (patients).
   */
  async getPermittedSubjectIds(userId: string): Promise<string[]> {
    const permissions = await this.permissionsRepository.find({
      relations: ['subject'],
      where: { target: { userId } },
    });
    const userIds = permissions.map(p => p.subject.userId);
    return userIds;
  }

  /**
   * Gets identities of users (therapists) that have permissions for a user (patient).
   * @param userId Identity of user (patient).
   * @returns Identities of users (therapists).
   */
  async getPermittedTargetsOf(
    userId: string,
    ...relations: string[]
  ): Promise<User[]> {
    const additionalRelations = relations.map(r => 'target.' + r);
    const permissions = await this.permissionsRepository.find({
      relations: ['target', ...additionalRelations],
      where: { subject: { userId } },
    });
    return permissions.map(p => p.target);
  }

  /**
   * Validates if a user is permitted for all requested types.
   * @param subjectUserId Identity of subject user (callee).
   * @param targetUserId Identity of target user (caller).
   * @param types Types to validate.
   */
  async isUserPermitted(
    subjectUserId: string,
    targetUserId: string,
    ...types: ChannelType[]
  ): Promise<boolean> {
    const permissions = await this.permissionsRepository.findOneBy({
      subject: { userId: subjectUserId },
      target: { userId: targetUserId },
    });
    return types.every(t => {
      switch (t) {
        case ChannelType.ecg:
          return permissions.ecg;
        case ChannelType.eda:
          return permissions.eda;
        case ChannelType.eyetracking:
          return permissions.eyetracking;
        case ChannelType.movement:
          return permissions.movement;
        default:
          return false;
      }
    });
  }

  /**
   * Checks if a socket is a monitor or receiver and is permitted to call a sender socket.
   * @param callerSocketId Identity of user that tries to call.
   * @param calleeUserId Identity of sender socket that is called.
   * @returns true = permitted, false = not permitted.
   */
  async isUserPermittedToCallSender(
    callerUserId: string,
    calleeUserId: string,
  ): Promise<boolean> {
    const count = await this.permissionsRepository.count({
      where: {
        subject: { userId: calleeUserId },
        target: { userId: callerUserId },
      },
    });
    return count > 0;
  }

  /**
   * Removes specific permissions.
   * @param description Description of permissions to remove.
   */
  async removePermissions(description: PermissionDescription): Promise<void> {
    this.permissionsRepository.delete({
      subject: { userId: description.subjectId },
      target: { userId: description.targetId },
    });
  }

  /**
   * Updates existing permissions.
   * @param description Description of permissions.
   */
  async updatePermissions(description: PermissionDescription): Promise<void> {
    const criteria = {
      subject: { userId: description.subjectId },
      target: { userId: description.targetId },
    };
    delete description.subjectId;
    delete description.targetId;
    await this.permissionsRepository.update(criteria, description);
  }
}
