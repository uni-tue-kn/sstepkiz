export const environment = {
  production: true,
  urls: {
    gameApi: `https://${$ENV.GAMIFICATION_DOMAIN}/game-logic`,
    imeraApi: `https://${$ENV.IMERA_DOMAIN}/sstep-kiz`,
    signallingAdmin: `https://${$ENV.SIGNALLING_DOMAIN}`,
    signallingServer: $ENV.SIGNALLING_DOMAIN,
    ssoServer: $ENV.SSO_ISSUER,
    stunServers: [ `stun:${$ENV.STUN_DOMAIN}` ],
    turnServers: [ `turns:${$ENV.TURN_DOMAIN}` ],
  },
  clientId: $ENV.CLIENT_ID,
};
