#!/bin/bash
cd "$(dirname "$0")"

# Run the checker and log output
# Note: dotenv/config in check-website.js handles .env loading
node check-website.js >> check-website.log 2>&1

