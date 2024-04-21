#!/bin/bash
# Counts the number of lines per file extension in a Git repository's current state
# Initialize an associative array to hold line counts
declare -A line_counts

# Find the Git repository root directory
repo_root=$(git rev-parse --show-toplevel)

# Move to the repository root directory
cd "$repo_root" || exit 1

# List all files in the repo that are not ignored by .gitignore
files=$(git ls-files)

# Loop over each file
for file in $files; do
    # Extract the extension of the file
    extension="${file##*.}"
    
    # Count the lines in the file
    lines=$(wc -l <"$file")
    
    # Add the line count to the respective extension in the associative array
    if [ -n "${line_counts[$extension]}" ]; then
        line_counts[$extension]=$((line_counts[$extension] + lines))
    else
        line_counts[$extension]=$lines
    fi
done

# Sort the results by line count in descending order and write to a text file
for ext in "${!line_counts[@]}"; do
    echo "$ext: ${line_counts[$ext]}"
done | sort -t: -k2,2nr > line_counts.txt

# Display the sorted results (optional)
cat line_counts.txt
