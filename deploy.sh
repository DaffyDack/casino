#!/bin/bash

DEPLOY_SERVER=$DEPLOY_SERVER
SERVER_FOLDER=$SERVER_FOLDER
DEPLOY_USER=$DEPLOY_USER
SSH_PRIVATE_KEY=$SSH_PRIVATE_KEY
PASSWORD=$PASSWORD
# Building React output
yarn install
yarn run build-dev
ls dist
echo "Deploying to ${DEPLOY_SERVER}"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -r ./dist/* ${DEPLOY_USER}@${DEPLOY_SERVER}:${SERVER_FOLDER} && echo "Finished copying the build files"

