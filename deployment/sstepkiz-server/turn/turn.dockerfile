FROM alpine:latest

# Update packages
RUN apk update && apk upgrade

# Install and update CA certificates
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Install dependencies
RUN apk add --no-cache curl jq openssl coturn

# Create and cleanup configuration directory /etc/coturn
RUN rm -rf /etc/coturn && mkdir /etc/coturn && mkdir /etc/coturn/dh && mkdir /etc/coturn/tls && chown -R turnserver:turnserver /etc/coturn
# Create and cleanup persistent directory /var/lib/coturn
RUN rm -rf /var/lib/coturn && rm -rf /var/lib/turnserver && mkdir /var/lib/coturn && chown -R turnserver:turnserver /var/lib/coturn
# Create /var/run sub directory for pid file
RUN mkdir /var/run/coturn && chown -R turnserver:turnserver /var/run/coturn

# Give non-root user permissions to access the acme volume dir /etc/coturn/acme
RUN mkdir /etc/coturn/acme && chown -R turnserver:turnserver /etc/coturn/acme

# Copy coturn default configuration
COPY --chown=turnserver:turnserver ./turnserver.conf /etc/coturn/turnserver.conf

# Copy scripts
COPY --chown=turnserver:turnserver ./detect-external-ip.sh /usr/local/bin/detect-external-ip
COPY --chown=turnserver:turnserver ./generate-dh-params.sh /usr/local/bin/generate-dh-params
COPY --chown=turnserver:turnserver ./import-traefik-cert.sh /usr/local/bin/import-traefik-cert
COPY --chown=turnserver:turnserver ./entrypoint.sh /usr/local/bin/entrypoint

RUN chmod u+x /usr/local/bin/entrypoint
RUN chmod u+x /usr/local/bin/detect-external-ip
RUN chmod u+x /usr/local/bin/generate-dh-params
RUN chmod u+x /usr/local/bin/import-traefik-cert

# Create Environment variables
ENV DOMAIN_NAME=
# Diffie-Hellman parameter
ENV DH_KEY_FILE=/etc/coturn/dh/dh_key.pem
ENV DH_KEY_LENGTH=2048
# Traefik ACME configuration
ENV ACME_FILE=
ENV TLS_CERT_RESOLVER=letsencrypt
ENV CERTIFICATE_FILE=/etc/coturn/tls/turn_server_cert.pem
ENV PRIVATE_KEY_FILE=/etc/coturn/tls/turn_server_pkey.pem
# PORT configuration
ENV PORT=3478
ENV TLS_PORT=5349
ENV MIN_PORT=49152
ENV MAX_PORT=65535

# Expose all ports
EXPOSE $PORT
EXPOSE $TLS_PORT
EXPOSE ${MIN_PORT}-${MAX_PORT}

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]
