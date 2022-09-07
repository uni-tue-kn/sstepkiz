export const environment = {
  production: false,
  urls: {
    gameApi: "https://game-test.example.org",
    // gameApi: '/game-api',
    imeraApi: 'https://imera-test.example.org/sstep-kiz',
    // imeraApi: '/imera-api',
    signallingAdmin: 'https://signalling-test.example.org',
    // signallingAdmin: '/signalling-api',
    signallingServer: 'https://signalling-test.example.org',
    // signallingServer: 'ws://localhost:3300',
    ssoServer: 'https://sso-test.example.org/auth/realms/sstep-kiz',
    stunServers: [ 'stun:stun.example.org:5349' ],
    turnServers: [ 'turns:turn.example.org:5349' ],
  },
  clientId: 'sstepkiz-therapist'
};
