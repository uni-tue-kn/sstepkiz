import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GamificationAdminService {

  /**
   * URL of gamification API.
   */
  readonly apiUrl = environment.urls.gameApi;

  /**
   * Constructs a new gamification administration service.
   * @param http HTTP Client instance.
   */
  constructor(
    private readonly http: HttpClient,
  ) {}

  /**
   * Creates a gamification profile for a given username.
   * @param username Username of gamification profile to create.
   * @throws When creation failed.
   */
  async createUser(username: string): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}`, {
        id: username,
      }).toPromise();
    } catch (error) {
      throw `Failed to create gamification profile for user ${username}: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Creates a gamification profile for a given username.
   * @param username Username of gamification profile to remove.
   * @throws When deletion failed.
   */
  async deleteUser(username: string): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/${username}`).toPromise();
    } catch (error) {
      if (error.status === 404) {
        return;
      }
      throw `Failed to delete gamification profile for user ${username}: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Finds gamification profiles.
   * @returns Usernames of gamification profiles.
   * @throws When finding user profiles failed.
   */
  async findUsers(): Promise<string[]> {
    try {
      return await this.http.get<string[]>(`${this.apiUrl}`).toPromise();
    } catch (error) {
      throw `Failed to find gamification profiles: ${error.status} ${error.statusText}`;
    }
  }
}
