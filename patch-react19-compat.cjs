const fs = require('fs');
const path = require('path');

console.log('🔧 Applying React 19 compatibility patches...');

// use-callback-ref のファイルをパッチ
const files = [
  'node_modules/use-callback-ref/dist/es5/useMergeRef.js',
  'node_modules/use-callback-ref/dist/es2015/useMergeRef.js',
  'node_modules/use-callback-ref/dist/es2019/useMergeRef.js',
];

let patchedCount = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // すべての useIsomorphicLayoutEffect の定義を置換
  // パターンマッチングではなく、ファイル全体から該当行を探して置換
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    // useIsomorphicLayoutEffect の定義行を検出
    if (
      line.includes('useIsomorphicLayoutEffect') &&
      line.includes('typeof window') &&
      (line.includes('React.useLayoutEffect') ||
        line.includes('React.useEffect'))
    ) {
      // ES5版（var）
      if (line.trim().startsWith('var ')) {
        return "var useIsomorphicLayoutEffect = function() { try { if (typeof window !== 'undefined') { return (window.React && window.React.useLayoutEffect) || (typeof React !== 'undefined' && React.useLayoutEffect); } else { return (window.React && window.React.useEffect) || (typeof React !== 'undefined' && React.useEffect); } } catch(e) { return function() {}; } }();";
      }
      // ES6版（const）
      else if (line.trim().startsWith('const ')) {
        return "const useIsomorphicLayoutEffect = (() => { try { if (typeof window !== 'undefined') { return (window.React && window.React.useLayoutEffect) || (typeof React !== 'undefined' && React.useLayoutEffect); } else { return (window.React && window.React.useEffect) || (typeof React !== 'undefined' && React.useEffect); } } catch(e) { return () => {}; } })();";
      }
    }
    return line;
  });

  content = newLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched: ${file}`);
    patchedCount++;
  } else {
    console.log(`ℹ️  No changes needed: ${file}`);
  }
});

console.log(`\n✨ Patch complete! ${patchedCount} file(s) modified.`);
