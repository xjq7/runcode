FROM rust:latest

RUN useradd --create-home --no-log-init --shell /bin/bash user \
  && adduser user sudo 

USER user

WORKDIR /home/user