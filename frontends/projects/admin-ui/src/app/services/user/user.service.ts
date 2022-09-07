import { EventEmitter, Injectable } from '@angular/core';

import { UserDescription } from '../../types/user-description.interface';
import { GamificationAdminService } from '../gamification-admin/gamification-admin.service';
import { ImeraAdminService } from '../imera-admin/imera-admin.service';
import { SignallingAdminService } from '../signalling-admin/signalling-admin.service';

@Injectable({ providedIn: 'root' })
export class UserService {

  /**
   * Mapping of usernames to user descriptions.
   */
  private readonly _users = new Map<String, UserDescription>();

  /**
   * Gets a description of all users.
   */
  get users(): UserDescription[] {
    return [...this._users.values()];
  }

  /**
   * Indicates changes of user list.
   */
  readonly usersChange = new EventEmitter<UserDescription[]>();

  /**
   * Constructs a new User Service.
   * @param gamification Gamification Administration Service instance.
   * @param imera IMeRa Administration Service instance.
   * @param signalling Signalling Administration Service instance..
   */
  constructor(
    private readonly gamification: GamificationAdminService,
    private readonly imera: ImeraAdminService,
    private readonly signalling: SignallingAdminService,
  ) { }

  /**
   * Creates a new user from a description.
   * @param user Description of user to create.
   * @returns Applied user description.
   * @throws When creating user failed.
   */
  async createUser(user: UserDescription): Promise<UserDescription> {
    try {
      const keycloakUser = await this.imera.createUser({
        username: user.username,
        password: user.password,
        group: user.group,
      });
      await Promise.all([
        this.gamification.createUser(user.username),
        this.signalling.createUser({
          username: user.username,
        }),
      ]);
      const newUser = {
        username: keycloakUser.username,
        id: keycloakUser.id,
        userId: keycloakUser.userId,
        group: keycloakUser.group,
      };
      this._users.set(newUser.username, newUser);
      this.usersChange.emit([...this.users]);
      return newUser;
    } catch (error) {
      throw `Failed to create user "${user.username}": ${error}`;
    }
  }

  /**
   * Deletes a user.
   * @param user User to delete.
   * @throws When deleting user failed.
   */
  async deleteUser(user: UserDescription): Promise<void> {
    try {
      await Promise.all([
        this.imera.deleteUser({ name: user.username, id: user.id }),
        this.gamification.deleteUser(user.username),
        this.signalling.deleteUser(user.username),
      ]);
      this._users.delete(user.username);
      this.usersChange.emit(this.users);
    } catch (error) {
      throw `Failed to delete user "${user.username}": ${error}`;
    }
  }

  /**
   * Updates a user by username of given user description.
   * @param user New user description.
   * @returns Updated user description.
   */
  async editUser(user: UserDescription): Promise<UserDescription> {
    try {
      const result: UserDescription = JSON.parse(JSON.stringify(user));
      if (user.permissions) {
        const signallingUser = await this.signalling.editUser({ username: user.username, permissions: user.permissions });
        result.permissions = signallingUser.permissions;
      }
      if (user.password || user.group) {
        await this.imera.modifyUser(user);
        if (user.password) {
          delete result.password;
        }
      }
      this._users.set(result.username, result);
      this.usersChange.emit(this.users);
      return result;
    } catch (error) {
      throw `Failed to edit user: ${error}`;
    }
  }

  /**
   * Finds description of all users.
   * @returns List of found users.
   * @throws When users cannot be found.
   */
  async findUsers(): Promise<UserDescription[]> {
    try {
      const imeraUsers = await this.imera.findUsers();
      const signallingUsers = await this.signalling.findUsers();
      const users = imeraUsers.map<UserDescription>(user => ({
        username: user.username,
        id: user.id,
        userId: user.userId,
        group: user.group ?? null,
        permissions: signallingUsers.find(u => u.username === user.username)?.permissions
      }));
      this._users.clear();
      users.forEach(user => {
        this._users.set(user.username, user);
      });
      this.usersChange.emit(this.users);
      return users;
    } catch (error) {
      throw `Failed to find users: ${error}`;
    }
  }
}
