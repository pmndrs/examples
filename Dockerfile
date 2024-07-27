# https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.jammy
# FROM mcr.microsoft.com/playwright:v1.45.3-jammy
FROM node:20-bookworm

WORKDIR /app

COPY . .
RUN ls -al .

RUN npm ci
RUN npx -y playwright@1.45.3 install --with-deps
RUN ls -al node_modules/.bin