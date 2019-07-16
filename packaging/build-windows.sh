#!/usr/bin/env bash
PREBUILT="https://github.com/electron/electron/releases/download/v5.0.5/electron-v5.0.5-win32-x64.zip"
VERSION="v0.1.0"

mkdir build-win
cd build-win

wget -O prebuilt.zip "${PREBUILT}"
unzip prebuilt.zip
rm prebuilt.zip
cd resources
git clone https://github.com/soatok/floofpal app
cd app
# git tag -v $VERSION
npm install
rm -rf .git
cd ..
cd ..
zip "../fursona-sticker-switcher-${VERSION}-win.zip" -r ./*
cd ..
rm -rf build-win
