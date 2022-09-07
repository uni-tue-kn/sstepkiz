import { Injectable } from '@nestjs/common';
import { EventEmitter } from '../../../../../shared/dist';
import {
  CallbackParamsType,
  Client,
  generators,
  IdTokenClaims,
  Issuer,
  TokenSet,
} from 'openid-client';

import { AuthEvents } from '../types/auth-events.type';
import { AuthState } from '../types/auth-state.enum';
import { AuthOptions } from '../types/auth-options.class';
import { AUTH_ENDPOINT } from '../types/endpoints';
import { LoggerService } from '@libs/logger';
import { ConfigService } from '@nestjs/config';


const DEFAULT_PORT : number = 3000;


@Injectable()
export class AuthService {
  /**
   * Gets the access token und undefined if not exists.
   */
  get accessToken(): string | undefined {
    return this.tokenSet?.access_token;
  }

  /**
   * Gets the ID token claims or undefined if no ID token exists.
   */
  get claims(): IdTokenClaims | undefined {
    return this.tokenSet?.claims();
  }

  /**
   * Instance of OIDC client.
   */
  private client?: Client;

  /**
   * Code Verifier for PKCE challenge.
   */
  private codeVerifier?: string;

  /**
   * Emitter for events.
   */
  private readonly eventEmitter: EventEmitter = new EventEmitter();

  /**
   * Gets the ID token or undefined if not exists.
   */
  get idToken(): string | undefined {
    return this.tokenSet?.id_token;
  }

  private _state: AuthState;
  /**
   * Gets the current state.
   */
  get state(): AuthState {
    return this._state;
  }

  /**
   * Received set of tokens.
   */
  private tokenSet: TokenSet;

  /**
   * Constructs a new authentication service.
   * @param loggerService Logger Service instance.
   * @param options Options for authentication.
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly options: AuthOptions,
    private readonly configService: ConfigService
  ) {
    this._state = AuthState.none;
  }

  /**
   * Adds an event listener.
   * @param event Name of event.
   * @param listener Listener callback to add.
   */
  addListener(event: AuthEvents, listener: (...args: any[]) => void): void {
    this.eventEmitter.addListener(event, listener);
  }

  /**
   * Performs all authentication steps in one.
   */
  authenticate(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Discover Authorization Server if not yet done.
        if (this.state === AuthState.none) {
          await this.discover();
        }
        // Request login.
        await this.getLoginUrl();
      } catch (error) {
        reject(error);
      }
      // Await callback.
      this.addListener('authenticated', () => resolve());
      this.addListener('error', error => reject(error));

      // Open aggregator in browser to login if not in the WSL
      if (process.platform === 'win32') {
        const open = require('open');
        const port = this.configService.get<number>('PORT', DEFAULT_PORT);
        const login_path = `http://localhost:${port}/login`;
        open(login_path);
      }
      else {
        this.loggerService.log(
          'Authentication pending. Please go to /login and authenticate.',
          this.constructor.name,
        );
      }
    });
  }

  /**
   * Verifies a received
   * @param parameters Received callback parameters.
   */
  async callback(parameters: CallbackParamsType): Promise<void> {
    if (!this.client) throw 'Client discovery required';
    this.setState(AuthState.verifying);
    // Prepares PKCE verification.
    const checks = { code_verifier: this.codeVerifier };
    // Performs PKCE verification and requests tokens from auth server.
    this.tokenSet = await this.client.callback(
      this.options.host + '/' + AUTH_ENDPOINT,
      parameters,
      checks,
    );
    // Cleanup PKCE challenge.
    this.codeVerifier = undefined;
    this.setState(AuthState.authenticated);
  }

  /**
   * Loads OIDC Authorization Server metadata documents and generates an OIDC client from received document.
   */
  private async discover(): Promise<void> {
    this.setState(AuthState.discovering);
    try {
      // Load OIDC Authorization Server metadata document.
      const issuer = await Issuer.discover(this.options.issuer);
      // Generate OIDC client form received document.
      this.client = new issuer.Client({
        authorization_signed_response_alg: this.options.signingAlgorithm,
        client_id: this.options.clientId,
        client_secret: this.options.clientSecret,
        id_token_signed_response_alg: this.options.signingAlgorithm,
        redirect_uris: [this.options.host + '/' + AUTH_ENDPOINT],
        response_types: ['code'],
        userinfo_signed_response_alg: this.options.signingAlgorithm,
      });
      this.setState(AuthState.discovered);
    } catch (error) {
      this.setState(AuthState.failed);
      throw 'OIDC discovery failed! Are you connected to the internet?';
    }
  }

  /**
   * Starts authentication request with PKCE challenge.
   */
  async getLoginUrl(): Promise<string> {
    if (!this.client) throw 'Client discovery required';
    this.setState(AuthState.authenticating);
    // Initiating PKCE challenge.
    this.codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(this.codeVerifier);
    // Generating Authentication URL.
    const url = this.client.authorizationUrl({
      code_challenge: codeChallenge,
      code_challenge_method: this.options.challengeMethod,
      scope: this.options.scopes.join(' '),
    });
    return url;
  }

  /**
   * Sets the state.
   * @param state New state.
   */
  private setState(state: AuthState): void {
    // Apply state.
    this._state = state;
    // Emit events.
    this.eventEmitter.emit('statechange');
    switch (state) {
      case AuthState.authenticated:
        this.eventEmitter.emit('authenticated');
        break;
      case AuthState.failed:
        this.eventEmitter.emit('error', 'Authentication failed');
        break;
    }
  }

  /**
   * Removes an event listener.
   * @param event Name of event.
   * @param listener Listener callback to add.
   */
  removeListener(event: AuthEvents, listener: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, listener);
  }
}
