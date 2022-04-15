#!/bin/bash

NAME=$(cat package.json | grep -oP '(?<="name": ")[^"]*')
VERSION=$(cat package.json | grep -oP '(?<="version": ")[^"]*')

docker build -t softwarevale/${NAME}:v${VERSION} -f docker/Dockerfile .

docker push softwarevale/${NAME}:v${VERSION}