export const environment = {
  production: false,
  urls: {
    gameApi: "https://game-test.example.org/game-logic",
    //gameApi: "http://localhost:3200/game-logic",
    imeraApi: "https://imera-test.example.org/sstep-kiz",
    signallingAdmin: "https://signalling-test.example.org",
    signallingServer: "https://signalling-test.example.org",
    ssoServer:
      "https://sso-test.example.org/auth/realms/sstep-kiz",
    stunServers: ["stun:stun.example.org:5349"],
    turnServers: ["turns:turn.example.org:5349"],
  },
  clientId: "sstepkiz-patient",
};
