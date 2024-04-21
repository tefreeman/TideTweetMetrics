#!/bin/bash

# Initialize an associative array to hold line counts by extension
declare -A line_counts

# Find the Git repository root directory
repo_root=$(git rev-parse --show-toplevel)

# Move to the repository root directory
cd "$repo_root" || exit 1

# Use git log with numstat to get line changes per file for all commits
while IFS= read -r line; do
    # Extract added lines and filename from the line
    added=$(echo "$line" | awk '{print $1}')
    file=$(echo "$line" | awk '{print $3}')
    
    # Continue only if 'added' is a number (skip merge commits which show '-')
    if [[ $added =~ ^[0-9]+$ ]]; then
        # Extract the filename after the last slash to ensure paths don't affect the extension extraction
        filename="${file##*/}"
        
        # Check if the filename ends with .ts (includes .service.ts, .spec.ts, etc.)
        if [[ "$filename" =~ \.ts$ ]]; then
            extension="ts"
        else
            # Fallback to extracting the extension after the last dot for other files
            extension="${filename##*.}"
        fi
        
        # Add the number of added lines to the respective extension
        if [ -n "${line_counts[$extension]}" ]; then
            line_counts[$extension]=$((line_counts[$extension] + added))
        else
            line_counts[$extension]=$added
        fi
    fi
done < <(git log --numstat --pretty="%H")

# Output the results sorted by the highest number of lines added
for ext in "${!line_counts[@]}"; do
    echo "$ext: ${line_counts[$ext]}"
done | sort -t: -k2,2nr
