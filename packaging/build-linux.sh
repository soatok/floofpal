#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v5.0.5/electron-v5.0.5-linux-x64.zip"
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
bash prepare-sandbox.sh
rm -rf .git
cd ..
cd ..
zip "../fursona-sticker-switcher-${VERSION}-linux.zip" -r ./*
cd ..
rm -rf build-linux
