#!/bin/bash

# Navigate to the project directory
cd "/home/sodervan/Documents/GREEN MOUSE TECHNOLOGIES/AO-Style"

echo "Current directory: $(pwd)"
echo "Git status:"
git status

echo "Adding all changes..."
git add -A

echo "Committing changes..."
git commit -m "Implement cart modal X buttons, authentication visibility, and fix dashboard duplicates

CART MODAL IMPROVEMENTS:
- Added X close buttons to all cart-related modals for better UX
- Updated CartSelectionModal with top-right X button
- Added X button to cart confirmation modal in AoStyleDetails
- Enhanced delete confirmation modal in CartPage with X button
- Improved SubmitProductModal with clean X button implementation
- Added X button to success modal in ShopDetails
- Consistent design pattern across all cart modals
- Better mobile experience with accessible close buttons

AUTHENTICATION FEATURES:
- Hide ChatHead component for unauthenticated users
- Hide ProductReviews component for unauthenticated users
- Created AuthenticatedProductReviews wrapper component
- Added token validation for adminToken and userToken cookies
- Added user type validation for review access
- Updated ShopDetails and AoStyleDetails to use authenticated components

DASHBOARD FIXES:
- Added deduplication logic to prevent duplicate entries in fabric/style lists
- Fixed ReusableTable to use proper unique keys instead of array indices
- Removed static data arrays that were contaminating dynamic data
- Updated FabricData, CustomerData, TailorData, LogisticsData processing
- Fixed ViewFabric, ViewTailor, FabricCategory, StyleCategories components
- Improved React rendering performance with better key management
- Resolved table header duplication issues
- Enhanced data consistency across desktop and mobile views

SECURITY IMPROVEMENTS:
- Prevents unauthorized access to chat functionality
- Hides review submission forms from guest users
- Protects user-specific features from public access
- Added debug logging for authentication checks"

echo "Current branch:"
git branch

echo "Pushing to bluebird_two (current branch)..."
git push origin blueBirdTwo

echo "Creating new_carybin repository..."
echo "Please create the repository 'new_carybin' on GitHub first:"
echo "1. Go to https://github.com/Greenmouse-Experts"
echo "2. Click 'New repository'"
echo "3. Name it 'new_carybin'"
echo "4. Make it private (recommended)"
echo "5. Do NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, press Enter to continue..."
read -p "Press Enter when repository is created..."

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

echo "Pushing to new_carybin with full precedence..."
git push new_carybin main --set-upstream

echo "Setting new_carybin as the primary repository..."
echo "Force pushing all branches to establish full precedence..."
git push new_carybin --all --force
git push new_carybin --tags --force

echo "Switching back to blueBirdTwo branch..."
git checkout blueBirdTwo

echo "Git operations completed successfully!"
echo "Summary:"
echo "1. Committed all changes to blueBirdTwo branch including:"
echo "   - Cart modal X button improvements for better UX"
echo "   - Authentication-based component visibility (ChatHead, ProductReviews)"
echo "   - Dashboard duplicate data fixes"
echo "   - Security improvements for guest users"
echo "2. Pushed to origin/blueBirdTwo"
echo "3. Created and pushed entire codebase to new_carybin with full precedence"
echo "4. Pushed all branches and tags to new_carybin"
echo ""
echo "new_carybin now has full precedence with all code and history"
echo ""
echo "🎯 CART MODALS: All cart modals now have X close buttons"
echo "🔒 SECURITY: Chat and reviews now hidden for unauthenticated users"
echo "🎯 UX: Clean interface for guest users with better modal interactions"
echo "✅ DASHBOARD: No more duplicate data entries"

git remote -v
