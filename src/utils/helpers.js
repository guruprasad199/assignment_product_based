// column number to letter: 0 -> A, 25 -> Z, 26 -> AA
export function getColumnName(index) {
  let name = '';
  let n = index + 1;
  while (n > 0) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

// row 0, col 1 -> B1
export function getCellId(row, col) {
  return getColumnName(col) + (row + 1);
}

// B3 -> { row: 2, col: 1 }
export function parseCellId(id) {
  const match = /^([A-Z]+)(\d+)$/.exec(id);
  if (!match) return null;

  let col = 0;
  for (const letter of match[1]) {
    col = col * 26 + (letter.charCodeAt(0) - 64);
  }
  return { row: Number(match[2]) - 1, col: col - 1 };
}
