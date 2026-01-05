#!/bin/bash
cd "$(dirname "$0")"

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Run the checker and log output
node check-website.js >> check-website.log 2>&1

