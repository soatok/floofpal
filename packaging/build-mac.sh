#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v5.0.5/electron-v5.0.5-darwin-x64.zip"
VERSION="v0.1.0"

mkdir build-mac
cd build-mac

wget -O prebuilt.zip "${PREBUILT}"
unzip prebuilt.zip
rm prebuilt.zip
cd Electron.app/Contents/Resources
git clone https://github.com/soatok/floofpal app
cd app
# git tag -v $VERSION
npm install
bash prepare-sandbox.sh
rm -rf .git
cd ..
cd ../../..
zip "../fursona-sticker-switcher-${VERSION}-mac.zip" -r ./*
cd ..
rm -rf build-mac
