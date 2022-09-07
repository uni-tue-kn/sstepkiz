import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UserGroups } from '../../types/user-description.interface';

@Injectable({ providedIn: 'root' })
export class ImeraAdminService {

  private readonly apiUrl = environment.urls.imeraBackend;
  private readonly defaultRoles = [
    'offline_access',
    'uma_authorization',
  ];

  constructor(
    private readonly http: HttpClient,
  ) {}

  /**
   * Converts a keycloak user to an SSO user.
   * @param user Keycloak user to convert.
   * @returns Converted SSO user.
   */
  private toSsoUser(user: KeycloakUser): SsoUser {
    return {
      username: user.name,
      userId: user.identityProviderId,
      id: user.id,
      group: this.rolesToGroup(user.roles.map(r => r.name)),
    };
  }

  private groupToRoles(group: UserGroups): string[] {
    switch (group) {
      case 'admin':
        return ['ADMIN', 'MANAGER', 'USER'];
      case 'patient':
        return ['USER'];
      case 'therapist':
        return ['MANAGER', 'USER'];
      default:
        return [];
    }
  }
  private rolesToGroup(roles: string[]): UserGroups | undefined {
    if (roles.indexOf('ADMIN') >= 0) {
      return 'admin';
    } else if (roles.indexOf('MANAGER') >= 0) {
      return 'therapist';
    } else if (roles.indexOf('USER') >= 0) {
      return 'patient';
    } else {
      return undefined;
    }
  }

  /**
   * Creates a new user in the SSO.
   * @param user Description of user to create.
   * @returns Applied user description.
   * @throws When creating user failed.
   */
  async createUser(user: SsoUser): Promise<SsoUser> {
    try {
      const defaultGroup = await this.getDefaultGroup();
      const roles = await this.getRoles();
      const usersRoles = [
        ...this.groupToRoles(user.group).map(roleName => roles.find(r => r.name === roleName)),
        ...this.defaultRoles.map(roleName => roles.find(r => r.name === roleName)),
      ];
      try {
        const newUser = {
          name: user.username,
          targetGroup: defaultGroup,
          initialCredentials: user.password,
          roles: usersRoles,
        };
        const result = await this.http.post<KeycloakUser>(`${this.apiUrl}/users`, newUser).toPromise();
        return {
          username: result.name,
          id: result.id,
          userId: result.identityProviderId,
          group: this.rolesToGroup(result.roles.map(r => r.name)),
        };
      } catch (error) {
        throw `${error.status} ${error.statusText}`;
      }
    } catch (error) {
      throw `Failed to create user "${user.username}" in SSO: ${error}`;
    }
  }

  /**
   * Deletes a user by username.
   * @param user Username and user ID of user to delete.
   * @throws When deleting user failed.
   */
  async deleteUser(user: { name: string, id: number }): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/users/${user.id}`).toPromise();
    } catch (error) {
      if (error.status === 404) {
        return;
      }
      throw `Failed to delete user "${user.name}" from IMeRa: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Finds users in SSO.
   * @returns Found Users.
   * @throws When finding failed.
   */
  async findUsers(): Promise<SsoUser[]> {
    try {
      const users = await this.http.get<KeycloakUser[]>(`${this.apiUrl}/users`).toPromise();
      return users.map<SsoUser>(user => this.toSsoUser(user));
    } catch (error) {
      throw `Failed to request users from IMeRa: ${error.status} ${error.statusText}`;
    }
  }

  private async setPassword(user: SsoUser) {
    try {
      await this.http.post(`${this.apiUrl}/users/${user.id}/reset-password`, {
        password: user.password,
      }).toPromise();
    } catch (error) {
      throw `Failed to set password: ${error.status} ${error.statusText}`;
    }
  }

  async modifyUser(user: SsoUser): Promise<SsoUser> {
    try {
      if (user.password) {
        await this.setPassword(user);
      }
      if (user.group) {
        const roles = await this.getRoles();
        const defaultGroup = await this.getDefaultGroup();
        try {
          const result = await this.http.put<KeycloakUser>(`${this.apiUrl}/users/${user.id}`, {
            targetGroup: defaultGroup,
            id: user.id,
            identityProviderId: user.userId,
            name: user.username,
            roles: [
              ...this.groupToRoles(user.group).map(roleName => roles.find(r => r.name === roleName)),
              ...this.defaultRoles.map(roleName => roles.find(r => r.name === roleName)),
            ]
          }).toPromise();
          return {
            username: result.name,
            id: result.id,
            userId: result.identityProviderId,
            group: this.rolesToGroup(result.roles.map(r => r.name)),
          };
        } catch (error) {
          throw `${error.status} ${error.statusText}`;
        }
      } else {
        if (user.password) {
          delete user.password;
        }
        return user;
      }
    } catch (error) {
      throw `Failed to modify IMeRa user: ${error}`;
    }
  }

  private async getGroups(): Promise<{ id: number, name: string }[]> {
    try {
      return await this.http.get<{ id: number, name: string }[]>(`${this.apiUrl}/targetgroup`).toPromise();
    } catch (error) {
      throw `Failed to get IMeRa target groups: ${error.status} ${error.statusText}`;
    }
  }
  private async getDefaultGroup(): Promise<{ id: number, name: string }> {
    return (await this.getGroups()).find(g => g.name === 'Default');
  }

  private async getRoles(): Promise<{ id: string, name: string }[]> {
    try {
      return await this.http.get<{ id: string, name: string }[]>(`${this.apiUrl}/roles`).toPromise();
    } catch (error) {
      throw `Failed to get IMeRa roles: ${error.status} ${error.statusText}`;
    }
  }
}

export interface SsoUser {
  username: string;
  id?: number;
  userId?: string;
  password?: string;
  group?: UserGroups;
  roles?: {
    id: string;
    name: string;
  }[];
}

interface KeycloakUser {
  id: number;
  identityProviderId: string;
  name: string;
  roles: {
    id: string;
    name: string;
  }[];
  targetGroup: {
    id: number;
    name: string;
  }
}