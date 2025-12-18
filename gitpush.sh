#!/bin/bash
# gitpush.sh — push changes to selected repo
# Usage: ./gitpush.sh "your commit message"

set -e

# Check for commit message
if [ -z "$1" ]; then
  echo "❌ Please provide a commit message!"
  echo "Usage: ./gitpush.sh \"your message\""
  exit 1
fi

# Ask user which project to push
echo "🌐 Select the project to push:"
echo "1️⃣ Vkart"
echo "2️⃣ NoshNurture"
echo "3️⃣ Sugran"
read -p "Enter your choice (1, 2, or 3): " choice

# Set origin based on user choice
case $choice in
  1)
    ORIGIN_URL="https://github.com/puregreyhat/Vkart.git"
    ;;
  2)
    ORIGIN_URL="https://github.com/puregreyhat/NoshNurture.git"
    ;;
  3)
    ORIGIN_URL="https://github.com/puregreyhat/sugran.git"
    ;;
  *)
    echo "❌ Invalid choice! Exiting."
    exit 1
    ;;
esac

# Update the origin
echo "🔄 Setting origin to $ORIGIN_URL"
git remote set-url origin "$ORIGIN_URL"

# Git push workflow
echo "📦 Adding changes..."
git add .

echo "📝 Committing changes..."
git commit -m "$1"

echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
