import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDescription } from '../../../../../../../shared/dist';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  /**
   * Constructs a new user service.
   * @param userRepository Instance of user repository.
   */
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user.
   * @param description Description of user.
   * @returns New stored user.
   */
  async createUser(description: UserDescription): Promise<User> {
    const newUser = new User(description.userId);
    return await this.userRepository.save(newUser);
  }

  /**
   * Deletes a user.
   * @param userId Identity of user.
   */
  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  /**
   * Gets a user entity by user identity.
   * @param userId Identity of user.
   * @param relations Names of relations to get.
   * @returns Found user or undefined if not found.
   */
  async getUserById(userId: string, ...relations: string[]): Promise<User> {
    if (relations.length > 0) {
      return await this.userRepository.findOne({
        where: {userId},
        relations,
      });
    } else {
      return await this.userRepository.findOneBy({
        userId: userId
      });
    }
  }

  /**
   * Gets descriptions of all users.
   * @param relations Relations to get.
   * @returns Descriptions of users.
   */
  async getUsers(...relations: string[]): Promise<UserDescription[]> {
    const users = await this.userRepository.find({ relations });
    const descriptions = users.map(u => u.getDescription());
    return descriptions;
  }
}
