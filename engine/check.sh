#!/bin/bash
# SolForge Engine Prerequisites Checker

echo "🔍 Checking SolForge Engine Prerequisites..."
echo ""

ALL_GOOD=true

# Check Node
echo -n "✓ Node.js: "
if command -v node &> /dev/null; then
    node --version
else
    echo "❌ NOT FOUND"
    ALL_GOOD=false
fi

# Check Anchor
echo -n "✓ Anchor CLI: "
if [ -f "/Users/prateektripathi/.cargo/bin/anchor" ]; then
    /Users/prateektripathi/.cargo/bin/anchor --version 2>&1 | head -1
else
    echo "❌ NOT FOUND at /Users/prateektripathi/.cargo/bin/anchor"
    ALL_GOOD=false
fi

# Check Solana
echo -n "✓ Solana CLI: "
if [ -f "/opt/homebrew/bin/solana" ]; then
    /opt/homebrew/bin/solana --version 2>&1 | head -1
else
    echo "❌ NOT FOUND at /opt/homebrew/bin/solana"
    ALL_GOOD=false
fi

# Check Deploy Key
echo -n "✓ Deploy Key: "
if [ -f "/Users/prateektripathi/.openclaw/workspace/autonomous-builder-x/deploy-key.json" ]; then
    echo "EXISTS"
else
    echo "❌ NOT FOUND"
    ALL_GOOD=false
fi

# Check API Key
echo -n "✓ API Key: "
if [ -f ".env" ] && grep -q "ANTHROPIC_API_KEY=sk-" .env; then
    echo "SET in .env"
else
    echo "⚠️  NOT SET (add to .env)"
    ALL_GOOD=false
fi

# Check Dependencies
echo -n "✓ Dependencies: "
if [ -d "node_modules" ]; then
    echo "INSTALLED"
else
    echo "❌ NOT INSTALLED (run: npm install)"
    ALL_GOOD=false
fi

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo "✅ All prerequisites met! Ready to run."
    echo ""
    echo "Start the engine:"
    echo "  npm run dev"
    echo ""
    echo "Or run the test:"
    echo "  npm test"
else
    echo "❌ Some prerequisites are missing. Check above."
    echo "See SETUP.md for detailed instructions."
    exit 1
fi
