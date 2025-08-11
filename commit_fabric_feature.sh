#!/bin/bash

# Navigate to the project directory
cd "/home/sodervan/Documents/GREEN MOUSE TECHNOLOGIES/AO-Style"

echo "Current directory: $(pwd)"
echo "Git status:"
git status

echo "Adding all changes..."
git add -A

echo "Committing fabric cancellation feature..."
git commit -m "Add fabric selection cancellation with X buttons

FABRIC SELECTION IMPROVEMENTS:
- Added X button to cancel selected fabric in AoStyleDetails
- Users can now remove fabric selection from style details page
- Added X button to fabric section in cart confirmation modal
- Removes fabric from both component state and localStorage
- Added toast notification for user feedback when fabric is removed
- Consistent design pattern with other modal X buttons
- Better user control over fabric selection workflow

UX IMPROVEMENTS:
- Users can easily undo fabric selections without starting over
- Intuitive X button placement in top-right corner of fabric cards
- Immediate feedback via success toast notifications
- Consistent behavior across main fabric display and modal
- Improved mobile experience with accessible touch targets

TECHNICAL DETAILS:
- Updated AoStyleDetails.jsx with fabric removal functionality
- Added proper state cleanup (setPendingFabric(null))
- Added localStorage cleanup (removeItem('pending_fabric'))
- Integrated with existing toast notification system
- Maintains accessibility with aria-labels and tooltips"

echo "Current branch:"
git branch

echo "Pushing to blueBirdTwo branch..."
git push origin blueBirdTwo

echo "Fabric cancellation feature committed and pushed to blueBirdTwo successfully!"
echo ""
echo "🎯 FABRIC SELECTION: Users can now cancel fabric selections with X buttons"
echo "🎯 UX: Better control over fabric selection workflow"
echo "✅ READY: Feature is live on blueBirdTwo branch"

git remote -v
