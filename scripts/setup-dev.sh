#!/bin/bash
# Setup script for DatCon Electron development

echo "🚀 Setting up DatCon Electron development environment..."

# Configure git commit template
git config commit.template .gitmessage

# Setup pre-commit hook (optional)
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
cd electron-app
npm run lint
EOF

chmod +x .git/hooks/pre-commit

# Create feature branch template
echo "📝 To create a feature branch, use:"
echo "  git checkout -b feature/your-feature-name"
echo ""
echo "📝 To create a bugfix branch, use:"
echo "  git checkout -b fix/issue-description"
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. cd electron-app"
echo "  2. npm install"
echo "  3. npm run dev"
