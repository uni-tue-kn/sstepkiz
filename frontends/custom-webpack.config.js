const webpack = require('webpack');

module.exports = (config, options, targetOptions) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      '$ENV': {
        GAMIFICATION_DOMAIN: JSON.stringify(process.env.GAMIFICATION_DOMAIN),
        IMERA_DOMAIN: JSON.stringify(process.env.IMERA_DOMAIN),
        SIGNALLING_DOMAIN: JSON.stringify(process.env.SIGNALLING_DOMAIN),
        SSO_BACKEND: JSON.stringify(process.env.SSO_BACKEND),
        SSO_ISSUER: JSON.stringify(process.env.SSO_ISSUER),
        CLIENT_ID: JSON.stringify(process.env.CLIENT_ID),
        TURN_DOMAIN: JSON.stringify(process.env.TURN_DOMAIN),
        STUN_DOMAIN: JSON.stringify(process.env.STUN_DOMAIN),
      }
    })
  );
};