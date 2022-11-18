FROM node:lts

RUN useradd --create-home --no-log-init --shell /bin/bash user \
  && adduser user sudo

USER user

WORKDIR /home/user

RUN npm init -y \
  && npm install mocha \
  && npm install chai