# 4chan-dhash-filter

A 4chan userscript to filter images based on dHash.

Performance is hopefully fine, perceptual hashing is done on thumbnails and the
hashes are cached in session storage. A BK-tree is used for efficient searches.

## Installation

Add the script to Violentmonkey from here:
<https://github.com/lmaonator/4chan-dhash-filter/raw/main/4chan-dhash-filter.user.js>

## Usage

CTRL+ALT Click an image thumbnail to add or remove it from the filter.

You can adjust some things in the script values:

- The image will be blurred by adding the `blurStyle` CSS filter. Enable or
  disable it by changing `blur` from `true` `false` or vice versa.
- The post will be hidden using either native or 4chan X functions. Enable or
  disable it with the `hide` value.
- `hammingDistance` controls how similar an image needs to be to be filtered.
  10 is a good default from my testing, higher values start to cause a lot of
  false positives, lower values miss a lot of images when spammers add noise.
- `hash_list` is the actual list of dHashes you added to filter.
