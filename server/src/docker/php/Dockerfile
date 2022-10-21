FROM php:8.2-rc-buster

RUN useradd --create-home --no-log-init --shell /bin/bash user \
  && adduser user sudo 

USER user

WORKDIR /home/user