import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-game',
  styleUrls: ['./game.component.scss'],
  templateUrl: './game.component.html',
})
export class GameComponent {

  userId: string

  constructor(private http: HttpClient) { }

  /**
   * Creat new user on game Server
   */
  create() {
    if (this.userId) {
      const headers = { 'content-type': 'application/json' };
      const body = JSON.stringify({
        avatarName: 'Wähle einen Namen',
        currentTitle: '',
        coins: 30,
        titles: [],
        monsters: [],
        items: []
      });
      this.http.post(
        environment.urls.gameApi + '/' + this.userId,
        body,
        { headers: headers }
      ).subscribe(
        (response) => { },
        (error) => console.error(error),
      );
    }
  }
}
