#!/bin/sh

pushd public/

echo "CACHE MANIFEST" > app.manifest
find . -type f | grep -v "\.DS_Store" |grep -v "\.manifest" >> app.manifest

popd
