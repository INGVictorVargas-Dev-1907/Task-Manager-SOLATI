FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY ./apidoc /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf