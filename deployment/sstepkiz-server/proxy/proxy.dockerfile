FROM traefik:2.6

COPY ./config.yaml /etc/traefik/config.yaml
RUN chmod 400 /etc/traefik/config.yaml
