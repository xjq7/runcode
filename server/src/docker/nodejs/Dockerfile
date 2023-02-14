FROM node:lts

RUN useradd --create-home --no-log-init --shell /bin/bash user \
  && adduser user sudo

USER user

WORKDIR /home/user

RUN npm config set registry https://registry.npmmirror.com \
  && npm init -y \
  && npm install mocha \
  && npm install chai \
  && npm install typescript