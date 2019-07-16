#!/usr/bin/env bash

sudo echo -e "" # Force password prompt here rather than in parallel process
rm *.zip
rm *.sig
echo "Building releases..."
parallel ::: "./build-linux.sh" "./build-mac.sh" "./build-windows.sh"
echo "Done. Now to sign each release zip..."
for filename in *.zip; do
    [[ -e "$filename" ]] || continue
    gpg --output "${filename}.sig" --detach-sig "${filename}"
done
echo "Done."
