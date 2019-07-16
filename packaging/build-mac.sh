#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v5.0.6/electron-v5.0.6-darwin-x64.zip"
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
sudo bash prepare-sandbox.sh node_modules/electron/dist/chrome-sandbox
rm -rf .git
cd ..
cd ../../..
zip "../floofpal-${VERSION}-mac.zip" -r ./*
cd ..
rm -rf build-mac
