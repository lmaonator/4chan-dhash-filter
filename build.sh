#!/usr/bin/env bash

set -euo pipefail

echo Running esbuild..
npx esbuild src/index.js --bundle --outfile=temp.js

echo Prepending header..
(cat header.txt; cat temp.js) > 4chan-dhash-filter.user.js

echo Deleting temp file..
rm temp.js

echo Done.
