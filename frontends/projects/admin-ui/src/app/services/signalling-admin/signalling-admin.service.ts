import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionDescription, UserDescription } from '@sstepkiz';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignallingAdminService {

  readonly apiUrl = environment.urls.signallingAdmin;

  /**
   * Constructs a new Signalling Service.
   * @param http Instance of HTTP client.
   */
  constructor(
    private readonly http: HttpClient
  ) {}

  /**
   * Requests the creation of new permissions.
   * @param description Description of permissions.
   * @returns Created permissions.
   */
  async createPermissions(description: PermissionDescription): Promise<PermissionDescription> {
    return await this.http.post<PermissionDescription>(this.apiUrl + '/permissions', description).toPromise();
  }

  /**
   * Requests the creation of a new user.
   * @param description Description of user.
   * @returns Created user.
   * @throws When user creation failed.
   */
  async createUser(userDescription: SignallingUser): Promise<SignallingUser> {
    try {
      const user = await this.http.post<{ userId: string }>(this.apiUrl + '/users', { userId: userDescription.username }).toPromise();
      const result: SignallingUser = {
        username: user.userId,
        permissions: {},
      };
      if (userDescription.permissions) {
        const descriptions = await Promise.all(
          Object.getOwnPropertyNames(userDescription.permissions).map(targetUsername => {
            const permission = userDescription.permissions[targetUsername];
            const permissionDescription: PermissionDescription = {
              subjectId: userDescription.username,
              targetId: targetUsername,
              ecg: permission.ecg,
              eda: permission.eda,
              eyetracking: permission.etk,
              movement: permission.mov,
            };
            return this.createPermissions(permissionDescription);
          }),
        );
        descriptions.forEach(d => {
          if (d.subjectId === user.userId) {
            result.permissions[d.targetId].ecg = d.ecg;
            result.permissions[d.targetId].eda = d.eda;
            result.permissions[d.targetId].etk = d.eyetracking;
            result.permissions[d.targetId].mov = d.movement;
          }
        });
      }
      return result;
    } catch (error) {
      throw `Failed to create user "${userDescription.username}" in on signalling server: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Requests the removal of a user.
   * @param userId Identity of user.
   * @throws When deleting failed.
   */
  async deleteUser(username: string): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/users/${username}`).toPromise();
    } catch (error) {
      if (error.status === 404) {
        return;
      }
      throw `Failed to delete user "${username}" from signalling server: ${error.status} ${error.statusText}`;
    }
  }

  async editUser(user: SignallingUser): Promise<SignallingUser> {
    try {
      const subjectsCurrentPermissions = (await this.findPermissions()).filter(p => p.subjectId === user.username);
      if (user.permissions) {
        const targetIds = Object.getOwnPropertyNames(user.permissions);
        const permissionsToRemove = subjectsCurrentPermissions.filter(p => targetIds.indexOf(p.targetId) < 0);
        const permissionsToUpdate = subjectsCurrentPermissions.filter(p => {
          if (targetIds.indexOf(p.targetId) < 0) return false;
          const permission = user.permissions[p.targetId];
          return ((p.ecg ?? false) !== (permission.ecg ?? false)) ||
            ((p.eda ?? false) !== (permission.eda ?? false)) || 
            ((p.eyetracking ?? false) !== (permission.etk ?? false)) || 
            ((p.movement ?? false) !== (permission.mov ?? false));
        }).map<PermissionDescription>(p => ({
          subjectId: user.username,
          targetId: p.targetId,
          ecg: user.permissions[p.targetId].ecg,
          eda: user.permissions[p.targetId].eda,
          eyetracking: user.permissions[p.targetId].etk,
          movement: user.permissions[p.targetId].mov,
        }));
        const permissionsToCreate = targetIds.filter(
          targetId => subjectsCurrentPermissions.findIndex(
            p => p.subjectId === user.username && p.targetId === targetId
          ) < 0
        ).map(targetId => {
          const permission = user.permissions[targetId];
          return {
            subjectId: user.username,
            targetId: targetId,
            ecg: permission.ecg,
            eda: permission.eda,
            eyetracking: permission.etk,
            movement: permission.mov,
          };
        });
        await Promise.all(permissionsToRemove.map(p => this.removePermissions(user.username, p.targetId)));
        const newPermissions = await Promise.all([
          ...permissionsToUpdate.map(async p => { this.updatePermissions(p); return p; }),
          ...permissionsToCreate.map(p => this.createPermissions(p)),
        ]);
        const previousPermissions = {};
        subjectsCurrentPermissions.filter(p => p.subjectId == user.username).forEach(p => previousPermissions[p.targetId] = {
          ecg: p.ecg,
          eda: p.eda,
          etk: p.eyetracking,
          mov: p.movement,
        });
        const result: SignallingUser = {
          username: user.username,
          permissions: previousPermissions,
        };
        newPermissions
          .filter(p => p.subjectId === user.username)
          .forEach(p => {
            result.permissions[p.targetId] = {
              ecg: p.ecg,
              eda: p.eda,
              etk: p.eyetracking,
              mov: p.movement,
            }
          });
        return result;
      } else {
        const appliedPermissions = subjectsCurrentPermissions;
        await Promise.all(
          appliedPermissions.map(p => {
            this.removePermissions(p.subjectId, p.targetId);
          })
        );
      }
    } catch (error) {
      throw `Failed to update permissions: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Requests all users.
   * @returns Found users.
   * @throws When finding failed.
   */
  async findUsers(): Promise<SignallingUser[]> {
    try {
      const users = await this.http.get<UserDescription[]>(this.apiUrl + '/users').toPromise();
      const permissions = await this.findPermissions();
      return users.map(user => {
        const p = permissions.filter(p => p.subjectId === user.userId).map(p => ({
          [p.targetId]: {
            ecg: p.ecg,
            eda: p.eda,
            etk: p.eyetracking,
            mov: p.movement,
          }
        }));
        const u = {
          username: user.userId,
          permissions: p.length > 0 ? p.reduce((p, c) => ({ ...p, ...c })): undefined,
        };
        return u;
      });
    } catch (error) {
      throw `Failed to request users from signalling server: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Requests all permissions.
   * @returns Found permissions.
   */
  private async findPermissions(): Promise<PermissionDescription[]> {
    return await this.http.get<PermissionDescription[]>(this.apiUrl + '/permissions').toPromise();
  }

  /**
   * Requests an update of permissions.
   * @param description New description of permissions.
   */
  async updatePermissions(description: PermissionDescription): Promise<void> {
    await this.http.put(this.apiUrl + '/permissions', description).toPromise();
  }

  /**
   * Requests the removal of permissions.
   * @param subjectId Identity of user that permits.
   * @param targetId Identity of user that is permitted.
   */
  async removePermissions(subjectId: string, targetId: string): Promise<void> {
    await this.http.delete(this.apiUrl + '/permissions/' + subjectId + '/' + targetId).toPromise();
  }
}

export interface Permissions {
  ecg?: boolean;
  eda?: boolean;
  etk?: boolean;
  mov?: boolean;
}

export interface SignallingUser {

  username: string;

  permissions?: {
    [targetUser: string]: Permissions;
  };
}