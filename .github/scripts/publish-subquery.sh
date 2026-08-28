#!/usr/bin/env bash

set -euo pipefail

while getopts "d:o:p:" flag; do
  case "${flag}" in
    d) directory=${OPTARG} ;;
    o) organization=${OPTARG} ;;
    p) project_name=${OPTARG} ;;
    *) exit 2 ;;
  esac
done

: "${directory:?Missing -d workspace directory}"
: "${organization:?Missing -o repository organization}"
: "${project_name:?Missing -p project name}"

cd "${directory}"

ipfs_cid=$(pnpm exec subql publish . --silent)

pnpm exec subql onfinality:create-deployment \
  --ipfsCID="${ipfs_cid}" \
  --projectName="${project_name}" \
  --org="${organization%/*}" \
  --type=primary \
  --useDefaults
