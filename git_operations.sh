#!/bin/bash

# Navigate to the project directory
cd "/home/sodervan/Documents/GREEN MOUSE TECHNOLOGIES/AO-Style"

echo "Current directory: $(pwd)"
echo "Git status:"
git status

echo "Adding all changes..."
git add -A

echo "Committing changes..."
git commit -m "Fix duplicate data rendering issues in dashboard components

- Added deduplication logic to prevent duplicate entries in fabric/style lists
- Fixed ReusableTable to use proper unique keys instead of array indices
- Removed static data arrays that were contaminating dynamic data
- Updated FabricData, CustomerData, TailorData, LogisticsData processing
- Fixed ViewFabric, ViewTailor, FabricCategory, StyleCategories components
- Improved React rendering performance with better key management
- Resolved table header duplication issues
- Enhanced data consistency across desktop and mobile views"

echo "Current branch:"
git branch

echo "Pushing to bluebird_two (current branch)..."
git push origin blueBirdTwo

echo "Checking if new_carybin remote exists..."
if git remote get-url new_carybin 2>/dev/null; then
    echo "new_carybin remote exists, updating..."
    git remote set-url new_carybin git@github.com:Greenmouse-Experts/new_carybin.git
else
    echo "Adding new_carybin remote..."
    git remote add new_carybin git@github.com:Greenmouse-Experts/new_carybin.git
fi

echo "Creating/switching to main branch for new_carybin..."
git checkout -b main 2>/dev/null || git checkout main

echo "Merging blueBirdTwo changes into main..."
git merge blueBirdTwo --no-ff -m "Merge blueBirdTwo with dashboard fixes into main"

echo "Force pushing to new_carybin with full precedence..."
git push new_carybin main --force

echo "Switching back to blueBirdTwo branch..."
git checkout blueBirdTwo

echo "Git operations completed successfully!"
echo "Summary:"
echo "1. Committed all changes to blueBirdTwo branch"
echo "2. Pushed to origin/blueBirdTwo"
echo "3. Force pushed entire codebase to new_carybin/main with full precedence"

git remote -v
