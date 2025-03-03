#!/bin/bash

# Script for making API calls to the NBA API
# Usage: ./scripts/api-call.sh [endpoint] [params]

# Set default values
API_BASE_URL="https://api.example.com/v1"
API_KEY=${NBA_API_KEY:-""}
OUTPUT_DIR="./data"
FORMAT="json"

# Print usage information
function print_usage() {
  echo "Usage: $0 [options] <endpoint>"
  echo ""
  echo "Options:"
  echo "  -k, --key KEY       API key (can also be set via NBA_API_KEY env var)"
  echo "  -o, --output DIR    Output directory (default: ./data)"
  echo "  -f, --format FORMAT Output format: json, csv (default: json)"
  echo "  -h, --help          Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 games/schedule --date=2023-12-25"
  echo "  $0 players/stats --player-id=123456 --season=2022-23"
}

# Parse command line arguments
PARAMS=""
while (( "$#" )); do
  case "$1" in
    -k|--key)
      API_KEY=$2
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR=$2
      shift 2
      ;;
    -f|--format)
      FORMAT=$2
      shift 2
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    --) # end argument parsing
      shift
      break
      ;;
    -*|--*=) # unsupported flags
      echo "Error: Unsupported flag $1" >&2
      print_usage
      exit 1
      ;;
    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done

# Set positional arguments
eval set -- "$PARAMS"

# Check if endpoint is provided
if [ -z "$1" ]; then
  echo "Error: No endpoint specified" >&2
  print_usage
  exit 1
fi

ENDPOINT=$1
shift

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Build the API URL with query parameters
QUERY_PARAMS=""
for param in "$@"; do
  QUERY_PARAMS="${QUERY_PARAMS}&${param}"
done

API_URL="${API_BASE_URL}/${ENDPOINT}?format=${FORMAT}${QUERY_PARAMS}"

# Make the API call
echo "Making API call to: $API_URL"
if [ -z "$API_KEY" ]; then
  echo "Warning: No API key provided. Some endpoints may require authentication."
  curl -s "$API_URL" > "${OUTPUT_DIR}/${ENDPOINT//\//_}.${FORMAT}"
else
  curl -s -H "Authorization: Bearer ${API_KEY}" "$API_URL" > "${OUTPUT_DIR}/${ENDPOINT//\//_}.${FORMAT}"
fi

echo "Response saved to ${OUTPUT_DIR}/${ENDPOINT//\//_}.${FORMAT}" 