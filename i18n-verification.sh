#!/bin/bash

echo "==================================="
echo "TaskFlow i18n Verification Script"
echo "==================================="
echo ""

echo "1. Checking i18n dependencies..."
npm list i18next react-i18next i18next-browser-languagedetector 2>/dev/null | grep -E "i18next|react-i18next|languagedetector"
echo ""

echo "2. Verifying locale files..."
for lang in en ja ko zh-CN; do
  file="src/i18n/locales/${lang}.json"
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo "  ✓ $lang.json ($lines lines)"
  else
    echo "  ✗ $lang.json - MISSING"
  fi
done
echo ""

echo "3. Checking TypeScript compilation..."
npm run typecheck 2>&1 | tail -1
echo ""

echo "4. Counting components using i18n..."
count=$(grep -r "useTranslation" src/components --include="*.tsx" | wc -l)
echo "  Components using useTranslation: $count"
echo ""

echo "5. Verifying key configuration files..."
files=(
  "src/i18n/config.ts"
  "src/contexts/LanguageContext.tsx"
  "src/components/LanguageSwitcher.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file - MISSING"
  fi
done
echo ""

echo "6. Build verification..."
echo "  Running production build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Build successful"
  
  # Check bundle size
  main_bundle=$(find build/assets/js -name "index-*.js" -type f | head -1)
  if [ -f "$main_bundle" ]; then
    size=$(du -h "$main_bundle" | cut -f1)
    echo "  ✓ Main bundle size: $size"
  fi
else
  echo "  ✗ Build failed"
fi
echo ""

echo "==================================="
echo "Verification Complete!"
echo "==================================="
