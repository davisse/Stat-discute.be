#!/bin/bash
# MCP Server Setup Script for NBA Bettor Agent
# Run this script to configure all required MCP servers

set -e

echo "================================"
echo "NBA Bettor Agent - MCP Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Claude CLI is installed
if ! command -v claude &> /dev/null; then
    echo -e "${RED}Error: Claude CLI not found${NC}"
    echo "Install with: npm install -g @anthropic-ai/claude-cli"
    exit 1
fi

echo "Checking existing MCP servers..."
echo ""

# Function to check and add MCP server
add_mcp_server() {
    local name=$1
    local package=$2
    local args=$3

    echo -n "Checking $name... "

    # Check if server exists (this is a simplified check)
    if claude mcp list 2>/dev/null | grep -q "$name"; then
        echo -e "${GREEN}Already configured${NC}"
    else
        echo -e "${YELLOW}Adding...${NC}"
        if [ -z "$args" ]; then
            claude mcp add "$name" -- npx -y "$package"
        else
            claude mcp add "$name" -- npx -y "$package" $args
        fi
        echo -e "${GREEN}Added $name${NC}"
    fi
}

# Required MCP Servers
echo ""
echo "Installing required MCP servers..."
echo "--------------------------------"

# 1. Sequential Thinking (already have, but ensure it's there)
echo ""
echo "1. Sequential Thinking Server"
echo "   Purpose: Structured multi-step reasoning"
add_mcp_server "sequential-thinking" "@modelcontextprotocol/server-sequential-thinking"

# 2. SQLite for Memory
echo ""
echo "2. SQLite Memory Server"
echo "   Purpose: Episodic memory for bet tracking"
# Create data directory first
mkdir -p "$(dirname "$0")/../data"
DB_PATH="$(cd "$(dirname "$0")/../data" && pwd)/agent_memory.db"
add_mcp_server "agent-memory" "@anthropic/mcp-server-sqlite" "--db-path $DB_PATH"

# 3. Brave Search (optional - for news research)
echo ""
echo "3. Brave Search Server (optional)"
echo "   Purpose: Real-time news and injury reports"
if [ -n "$BRAVE_API_KEY" ]; then
    add_mcp_server "brave-search" "@anthropic/mcp-server-brave-search"
else
    echo -e "${YELLOW}Skipped: BRAVE_API_KEY not set${NC}"
    echo "   To add later: export BRAVE_API_KEY=your_key && claude mcp add brave-search"
fi

echo ""
echo "================================"
echo "MCP Setup Complete!"
echo "================================"
echo ""
echo "Current MCP servers:"
claude mcp list 2>/dev/null || echo "(Run 'claude mcp list' to see configured servers)"
echo ""
echo "Next steps:"
echo "  1. cd betting-agent"
echo "  2. uv venv && source .venv/bin/activate"
echo "  3. uv pip install -e '.[dev]'"
echo "  4. python -m src.main analyze 'test query'"
echo ""
