FROM node:16-alpine AS builder

ARG GAMIFICATION_DOMAIN=localhost:3200
ARG SIGNALLING_DOMAIN=localhost:3300
ARG SSO_ISSUER=http://localhost:8080/auth/realms/sstepkiz
ARG SSO_BACKEND=http://localhost:8080/sstekiz
ARG CLIENT_ID=admin

# Update NPM.
RUN npm install --location=global npm@8.18

WORKDIR /app
COPY ./shared ./shared
COPY ./frontends ./frontends

WORKDIR /app/shared
RUN npm install --save
RUN npm run build

WORKDIR /app/frontends
RUN npm install --save
RUN npm run build:admin

FROM nginx:1.21-alpine
COPY ./deployment/sstepkiz-server/ui/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontends/dist/admin-ui/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
