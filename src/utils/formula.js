import { getCellId, parseCellId } from './helpers';

// A1:B2 -> [A1, B1, A2, B2]
function expandRange(range) {
  const [startId, endId = startId] = range.split(':');
  const start = parseCellId(startId);
  const end = parseCellId(endId);
  if (!start || !end) return null;

  const ids = [];
  for (let row = Math.min(start.row, end.row); row <= Math.max(start.row, end.row); row++) {
    for (let col = Math.min(start.col, end.col); col <= Math.max(start.col, end.col); col++) {
      ids.push(getCellId(row, col));
    }
  }
  return ids;
}

// returns the value to show in a cell. if the cell has a formula, calculate it
// visited keeps track of cells already checked, to stop circular formulas
export function evaluateCell(id, cells, visited = []) {
  const raw = cells[id]?.value ?? '';
  if (!raw.startsWith('=')) return raw; // normal value, not a formula
  if (visited.includes(id)) return '#CIRCULAR';

  // only SUM and AVERAGE are supported
  const match = raw.slice(1).trim().match(/^(SUM|AVERAGE)\((.*)\)$/i);
  if (!match) return '#ERROR';

  const numbers = [];
  for (const part of match[2].split(',')) {
    const arg = part.trim().toUpperCase();
    if (arg === '') continue;

    // a plain number like =SUM(A1, 5)
    if (!isNaN(arg)) {
      numbers.push(Number(arg));
      continue;
    }

    const ids = expandRange(arg);
    if (!ids) return '#ERROR';

    for (const refId of ids) {
      // the referenced cell can also have a formula
      const value = evaluateCell(refId, cells, [...visited, id]);
      if (typeof value === 'string' && value.startsWith('#')) return value;
      // skip empty and text cells
      if (value !== '' && !isNaN(value)) numbers.push(Number(value));
    }
  }

  const sum = numbers.reduce((total, n) => total + n, 0);
  if (match[1].toUpperCase() === 'SUM') return round(sum);
  if (numbers.length === 0) return '#DIV/0';
  return round(sum / numbers.length);
}

// round to 2 decimal places
function round(value) {
  return Math.round(value * 100) / 100;
}
