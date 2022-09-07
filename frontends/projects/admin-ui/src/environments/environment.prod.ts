import { DIGITS, LOWER_CASES, SPECIAL_CHARS, UPPER_CASES } from "../app/types/password-generator/password-generator";

declare var $ENV: {
  [name: string]: string
};

export const environment = {
  production: true,
  urls: {
    gameApi: `https://${$ENV.GAMIFICATION_DOMAIN}/game-logic`,
    signallingAdmin: `https://${$ENV.SIGNALLING_DOMAIN}`,
    imeraBackend: $ENV.SSO_BACKEND,
    ssoServer: $ENV.SSO_ISSUER,
  },
  requiredScopes: [
    'signalling_admin',
    'game_admin',
  ],
  clientId: $ENV.CLIENT_ID,
  usernamePolicy: {
    minLength: 3,
    maxLength: 20,
    pattern: '[a-z0-9]*',
  },
  passwordPolicy: {
    minLength: 8,
    maxLength: 64,
    defaultLength: 20,
    specialChars: SPECIAL_CHARS,
    rule: [
      { allowedChars: UPPER_CASES, name: 'uppercase' },
      { allowedChars: LOWER_CASES, name: 'lowercase' },
      { allowedChars: DIGITS, name: 'digit' },
      { allowedChars: SPECIAL_CHARS, name: 'special' },
    ],
  }
};
