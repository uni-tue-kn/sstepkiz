import { DIGITS, LOWER_CASES, SPECIAL_CHARS, UPPER_CASES } from "../app/types/password-generator/password-generator";

export const environment = {
  production: false,
  urls: {
    // gameApi: '/game-api/game-logic',
    gameApi:'https://game-test.example.org/game-logic',
    // signallingAdmin: '/signalling-api',
    signallingAdmin: 'https://signalling-test.example.org',
    imeraBackend: 'http://localhost:8080/sstep-kiz',
    // imeraBackend: 'https://imera-test.example.org/sstep-kiz',
    // ssoServer: 'http://localhost:8080/auth/realms/sstep-kiz',
    ssoServer: 'https://sso-test.example.org/auth/realms/sstep-kiz',
  },
  requiredScopes: [
    'signalling_admin',
    'game_admin',
  ],
  clientId: 'sstepkiz-admin',
  usernamePolicy: {
    minLength: 3,
    maxLength: 20,
    pattern: '[a-z0-9]*',
  },
  passwordPolicy: {
    minLength: 8,
    maxLength: 64,
    defaultLength: 14,
    specialChars: SPECIAL_CHARS,
    rule: [
      { allowedChars: UPPER_CASES, name: 'uppercase' },
      { allowedChars: LOWER_CASES, name: 'lowercase' },
      { allowedChars: DIGITS, name: 'digit' },
      { allowedChars: SPECIAL_CHARS, name: 'special' },
    ],
  }
};
