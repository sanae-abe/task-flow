// ローカルストレージをクリアするための簡単なスクリプト
console.log('Clearing localStorage...');
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('cheer-table-columns');
  console.log('Table columns settings cleared');
} else {
  console.log('localStorage not available');
}