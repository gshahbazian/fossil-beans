#!/bin/bash

# Load API key from .env.local
API_KEY=$(grep API_KEY .env.local | cut -d '"' -f 2)

# Check if API_KEY is empty
if [ -z "$API_KEY" ]; then
  echo "Error: API_KEY not found in .env.local"
  exit 1
fi

# Default values
METHOD="GET"
CONTENT_TYPE="application/json"
DATA=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url|-u)
      URL="$2"
      shift 2
      ;;
    --method|-m)
      METHOD="$2"
      shift 2
      ;;
    --data|-d)
      DATA="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check if URL is provided
if [ -z "$URL" ]; then
  echo "Usage: $0 --url <url> [--method <GET|POST>] [--data <json_data>]"
  echo "Example: $0 --url http://localhost:3000/api/nba/insert-teams"
  exit 1
fi

# Build curl command
CURL_CMD="curl --request $METHOD --url \"$URL\" --header \"Authorization: Bearer $API_KEY\""

# Add content type and data if needed
if [ "$METHOD" = "POST" ]; then
  CURL_CMD="$CURL_CMD --header \"Content-Type: $CONTENT_TYPE\""
  if [ ! -z "$DATA" ]; then
    CURL_CMD="$CURL_CMD --data '$DATA'"
  fi
fi

# Execute the command
echo "Executing: $CURL_CMD"
eval $CURL_CMD
echo "" 