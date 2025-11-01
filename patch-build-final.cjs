#!/usr/bin/env node
/**
 * 本番ビルド後のuse-callback-refエラー修正パッチ（最終版）
 *
 * 修正対象パターン:
 * typeof window<"u"?React.useLayoutEffect:React.useEffect
 * → 両側でnullチェックを追加
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Final patching use-callback-ref for production...');

// buildディレクトリ内のJSファイルを検索
const jsFiles = glob.sync('build/assets/*.js');
let totalPatches = 0;

jsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  // 🎯 パターン1: 三項演算子のisomorphicパターン（最重要）
  // typeof window<"u"?Ie.useLayoutEffect:Ie.useEffect
  // → typeof window<"u"?(Ie&&Ie.useLayoutEffect?Ie.useLayoutEffect:Ie.useEffect):(Ie&&Ie.useEffect?Ie.useEffect:function(){})
  const isomorphicPattern = /typeof\s+window\s*<\s*["']u["']\s*\?\s*(\w+)\.useLayoutEffect\s*:\s*\1\.useEffect/g;
  if (isomorphicPattern.test(content)) {
    console.log(`📝 Patching isomorphic useLayoutEffect pattern in ${file}...`);
    content = content.replace(
      /typeof\s+window\s*<\s*["']u["']\s*\?\s*(\w+)\.useLayoutEffect\s*:\s*\1\.useEffect/g,
      'typeof window<"u"?($1&&$1.useLayoutEffect?$1.useLayoutEffect:($1&&$1.useEffect?$1.useEffect:function(){})):($1&&$1.useEffect?$1.useEffect:function(){})'
    );
    hasChanges = true;
    totalPatches++;
  }

  // パターン2: typeof window !== 'undefined' 形式
  const altIsomorphicPattern = /typeof\s+window\s*!==?\s*["']undefined["']\s*\?\s*(\w+)\.useLayoutEffect\s*:\s*\1\.useEffect/g;
  if (altIsomorphicPattern.test(content)) {
    console.log(`📝 Patching alt isomorphic useLayoutEffect pattern in ${file}...`);
    content = content.replace(
      /typeof\s+window\s*!==?\s*["']undefined["']\s*\?\s*(\w+)\.useLayoutEffect\s*:\s*\1\.useEffect/g,
      'typeof window!=="undefined"?($1&&$1.useLayoutEffect?$1.useLayoutEffect:($1&&$1.useEffect?$1.useEffect:function(){})):($1&&$1.useEffect?$1.useEffect:function(){})'
    );
    hasChanges = true;
    totalPatches++;
  }

  // パターン3: React.useLayoutEffect の直接参照（vendor-misc のみ）
  // ⚠️ 注意: typeof window.React.useLayoutEffect のような文脈で誤動作を防ぐため、
  // より制限的なパターンを使用
  if (file.includes('vendor-misc') && content.includes('React.useLayoutEffect')) {
    console.log(`📝 Patching React.useLayoutEffect in ${file}...`);
    // 負の後読みで typeof や . の直後でないことを確認
    content = content.replace(
      /(?<!typeof\s)(?<!\.)React\.useLayoutEffect/g,
      '(React&&React.useLayoutEffect?React.useLayoutEffect:(React&&React.useEffect?React.useEffect:function(){}))'
    );
    hasChanges = true;
    totalPatches++;
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
    console.log(`✅ Successfully patched ${file}`);
  }
});

console.log(`🎉 Patching complete! Applied ${totalPatches} patches.`);

// パッチ結果の検証（厳密版）
console.log('🔍 Verifying patches...');
let hasWarnings = false;

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // 危険なパターンのチェック
  const dangerousPatterns = [
    /typeof\s+window\s*<\s*["']u["']\s*\?\s*\w+\.useLayoutEffect\s*:\s*\w+\.useEffect/g,
    /typeof\s+window\s*!==?\s*["']undefined["']\s*\?\s*\w+\.useLayoutEffect\s*:\s*\w+\.useEffect/g,
  ];

  dangerousPatterns.forEach((pattern, index) => {
    const match = content.match(pattern);
    if (match) {
      console.warn(`⚠️  Warning: ${file} still contains dangerous pattern ${index + 1}:`);
      console.warn(`   ${match[0].substring(0, 100)}...`);
      hasWarnings = true;
    }
  });
});

if (!hasWarnings) {
  console.log('✅ All dangerous patterns have been patched!');
}
