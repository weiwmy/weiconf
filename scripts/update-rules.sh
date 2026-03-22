#!/bin/bash

# Define the URLs for the ruleset files
DIRECT_URL="https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/direct.txt"
PROXY_URL="https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/proxy.txt"
REJECT_URL="https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/reject.txt"

# Define the target directory
TARGET_DIR="docs/rules"

# Function to download a file
download_rule() {
    local url=$1
    local filename=$2
    echo "Downloading $filename from $url..."
    curl -sSL "$url" -o "$TARGET_DIR/$filename"
    if [ $? -eq 0 ]; then
        echo "Successfully updated $filename."
    else
        echo "Failed to download $filename."
        exit 1
    fi
}

# Ensure the target directory exists
mkdir -p "$TARGET_DIR"

# Download the rules
download_rule "$DIRECT_URL" "direct.txt"
download_rule "$PROXY_URL" "proxy.txt"
download_rule "$REJECT_URL" "reject.txt"

echo "All rules have been updated successfully."
