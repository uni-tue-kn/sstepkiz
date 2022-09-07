import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthValidationService implements OnDestroy {

  /**
   * If the client is logged in
   */
  loggedIn: boolean = false;

  /**
   * Reference to the observable, used for unsubscribing
   */
  private observableRef;

  private onLoginReturn = (e: booleanReturn) => {
    this.loggedIn = e.loggedIn;
    if (!this.loggedIn) {
      this.router.navigate(['/login']);
    }
  };

  /**
   * This checks if the user is logged in at the backend
   * @param http HttpClient for backend communication
   */
  constructor(
    private readonly http: HttpClient, 
    private readonly router: Router
  ) { }


  startIntervalChecking(): void {
    this.getLogInStatus().subscribe(this.onLoginReturn);

    this.observableRef = interval(environment.loginCheckInterval).pipe(mergeMap(() => {
      return this.getLogInStatus();
    })).subscribe(this.onLoginReturn);
  }

  private getLogInStatus(): Observable<booleanReturn> {
    return this.http.get<booleanReturn>(environment.urls.aggregatorBackend + '/login/status');
  }

  ngOnDestroy() {
    this.observableRef.unsubscribe();
  }
}

interface booleanReturn {
  loggedIn: boolean;
}
