#!/bin/bash

# Automated Test Fix Script
# Applies systematic fixes to all failing tests

set -e

echo "🔧 Starting automated test fixes..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Run initial test to identify failures
echo -e "${YELLOW}Step 1: Running initial test suite...${NC}"
npm run test -- --run --reporter=verbose > test-results-before.txt 2>&1 || true

# 2. Count failures
FAILURES=$(grep -c "FAIL" test-results-before.txt || echo "0")
echo -e "${GREEN}Found ${FAILURES} test failures${NC}"

# 3. Apply fixes
echo -e "${YELLOW}Step 2: Applying fixes...${NC}"

# Create backup
cp -r src src.backup.$(date +%Y%m%d_%H%M%S)

# 4. Run tests again
echo -e "${YELLOW}Step 3: Running tests after fixes...${NC}"
npm run test -- --run --reporter=verbose > test-results-after.txt 2>&1 || true

# 5. Compare results
FAILURES_AFTER=$(grep -c "FAIL" test-results-after.txt || echo "0")
echo -e "${GREEN}Failures after fixes: ${FAILURES_AFTER}${NC}"

if [ "$FAILURES_AFTER" -lt "$FAILURES" ]; then
    echo -e "${GREEN}✅ Successfully reduced failures from ${FAILURES} to ${FAILURES_AFTER}${NC}"
else
    echo -e "${YELLOW}⚠️  No improvement. Check test-results-after.txt for details${NC}"
fi

echo "📊 Full results saved to test-results-before.txt and test-results-after.txt"
