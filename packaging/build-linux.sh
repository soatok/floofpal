#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v5.0.6/electron-v5.0.6-linux-x64.zip"
VERSION="v0.1.0"

mkdir build-linux
cd build-linux

wget -O prebuilt.zip "${PREBUILT}"
unzip prebuilt.zip
rm prebuilt.zip
cd resources
git clone https://github.com/soatok/floofpal app
cd app
# git tag -v $VERSION
npm install
sudo ./prepare-sandbox.sh node_modules/electron/dist/chrome-sandbox
rm -rf .git
cd ..
cd ..
zip "../floofpal-${VERSION}-linux.zip" -r ./*
cd ..
rm -rf build-linux
