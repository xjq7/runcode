FROM python:3.9.18

RUN useradd --create-home --no-log-init --shell /bin/bash user \
  && adduser user sudo 

USER user

WORKDIR /home/user