import { useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from './Toolbar';
import Cell from './Cell';
import { getCellId, getColumnName } from '../utils/helpers';
import { evaluateCell } from '../utils/formula';

const DEFAULT_SIZE = 10;

function Spreadsheet() {
  const [rowCount, setRowCount] = useState(DEFAULT_SIZE);
  const [colCount, setColCount] = useState(DEFAULT_SIZE);
  // all cell data, saved by cell name like { A1: { value: '10', bold: true, bg: 'bgcolor' } }
  const [cells, setCells] = useState({});
  // start is the clicked cell, end is where the selecton is dragged to
  const [selection, setSelection] = useState({ start: { row: 0, col: 0 }, end: { row: 0, col: 0 } });
  const [editing, setEditing] = useState(null); // cell being edited right now
  const [clipboard, setClipboard] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef(null);

  // calculate what each cell show runs again when cells change so formulas update
  const displayValues = useMemo(() => {
    const values = {};
    Object.keys(cells).forEach((id) => {
      values[id] = evaluateCell(id, cells);
    });
    return values;
  }, [cells]);

  // stop selecting when mouse is released anywhere on the page
  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDragging);
    return () => window.removeEventListener('mouseup', stopDragging);
  }, []);

  const top = Math.min(selection.start.row, selection.end.row);
  const bottom = Math.max(selection.start.row, selection.end.row);
  const left = Math.min(selection.start.col, selection.end.col);
  const right = Math.max(selection.start.col, selection.end.col);
  const activeId = getCellId(selection.start.row, selection.start.col);

  function getSelectedIds() {
    const ids = [];
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) ids.push(getCellId(row, col));
    }
    return ids;
  }

  // update value or format of many cell at once
  function updateCells(ids, changes) {
    setCells((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...changes };
      });
      return next;
    });
  }

  // select a cell. if extend is true, make the selection bigger instead
  function select(row, col, extend = false) {
    row = Math.max(0, Math.min(row, rowCount - 1));
    col = Math.max(0, Math.min(col, colCount - 1));
    if (extend) setSelection((prev) => ({ ...prev, end: { row, col } }));
    else setSelection({ start: { row, col }, end: { row, col } });
  }

  // save type text into the cell
  function saveEdit() {
    if (!editing) return;
    updateCells([getCellId(editing.row, editing.col)], { value: editing.value });
    setEditing(null);
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') {
      saveEdit();
      select(editing.row + 1, editing.col);
      gridRef.current.focus();
    } else if (e.key === 'Escape') {
      setEditing(null);
      gridRef.current.focus();
    }
  }

  // shift click selects a range
  function handleMouseDown(row, col, e) {
    if (editing && editing.row === row && editing.col === col) return;
    saveEdit();
    select(row, col, e.shiftKey);
    setIsDragging(true);
  }

  function handleMouseEnter(row, col) {
    if (isDragging) select(row, col, true);
  }

  function handleDoubleClick(row, col) {
    setEditing({ row, col, value: cells[getCellId(row, col)]?.value ?? '' });
  }

  // if all selected cells are bold, remove bold. otherwise make them bold
  function toggleBold() {
    const ids = getSelectedIds();
    const allBold = ids.every((id) => cells[id]?.bold);
    updateCells(ids, { bold: !allBold });
  }

  function setBackground(color) {
    updateCells(getSelectedIds(), { bg: color });
  }

  // copy selected cells as rows
  function copy() {
    const copied = [];
    for (let row = top; row <= bottom; row++) {
      const rowData = [];
      for (let col = left; col <= right; col++) {
        rowData.push({ ...cells[getCellId(row, col)] });
      }
      copied.push(rowData);
    }
    setClipboard(copied);
  }

  // paste copied cells starting from the selected cell
  function paste() {
    if (!clipboard) return;
    const next = { ...cells };
    clipboard.forEach((rowData, r) => {
      rowData.forEach((cell, c) => {
        next[getCellId(top + r, left + c)] = { ...cell };
      });
    });
    setCells(next);
    // add rows/columns if pasted data goes outside the grid
    setRowCount((count) => Math.max(count, top + clipboard.length));
    setColCount((count) => Math.max(count, left + clipboard[0].length));
    setSelection({
      start: { row: top, col: left },
      end: { row: top + clipboard.length - 1, col: left + clipboard[0].length - 1 },
    });
  }

  function handleKeyDown(e) {
    if (editing) return; // input box handles keys while editing
    const { row, col } = selection.start;

    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'c') copy();
      if (key === 'v') paste();
      if (key === 'b') {
        e.preventDefault();
        toggleBold();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight': {
        e.preventDefault();
        const from = e.shiftKey ? selection.end : selection.start;
        const dRow = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        const dCol = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        select(from.row + dRow, from.col + dCol, e.shiftKey);
        break;
      }
      case 'Enter':
        e.preventDefault();
        handleDoubleClick(row, col);
        break;
      case 'Delete':
      case 'Backspace':
        updateCells(getSelectedIds(), { value: '' });
        break;
      default:
        // typing any letter or number starts editing
        if (e.key.length === 1) {
          e.preventDefault();
          setEditing({ row, col, value: e.key });
        }
    }
  }

  // download the sheet as a json file
  function saveToFile() {
    const data = { rows: rowCount, cols: colCount, cells };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'spreadsheet.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // read a json file and show it in the sheet
  function loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.rows || !data.cols || typeof data.cells !== 'object') {
          throw new Error('invalid file');
        }
        setRowCount(data.rows);
        setColCount(data.cols);
        setCells(data.cells);
        setEditing(null);
        select(0, 0);
      } catch {
        alert('Could not load this file. Please choose a spreadsheet JSON file.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="spreadsheet">
      <Toolbar
        isBold={Boolean(cells[activeId]?.bold)}
        onAddRow={() => setRowCount((count) => count + 1)}
        onAddColumn={() => setColCount((count) => count + 1)}
        onBold={toggleBold}
        onColor={setBackground}
        onCopy={copy}
        onPaste={paste}
        canPaste={Boolean(clipboard)}
        onSave={saveToFile}
        onLoad={loadFromFile}
      />

      <div className="grid-wrapper" ref={gridRef} tabIndex={0} onKeyDown={handleKeyDown}>
        <table className="grid">
          <thead>
            <tr>
              <th />
              {Array.from({ length: colCount }, (_, col) => (
                <th key={col}>{getColumnName(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, row) => (
              <tr key={row}>
                <th>{row + 1}</th>
                {Array.from({ length: colCount }, (_, col) => {
                  const id = getCellId(row, col);
                  const isEditing = editing && editing.row === row && editing.col === col;
                  return (
                    <Cell
                      key={id}
                      cell={cells[id]}
                      displayValue={displayValues[id]}
                      isSelected={row >= top && row <= bottom && col >= left && col <= right}
                      isActive={id === activeId}
                      isEditing={isEditing}
                      editValue={isEditing ? editing.value : ''}
                      onEditChange={(value) => setEditing({ ...editing, value })}
                      onEditKeyDown={handleEditKeyDown}
                      onEditBlur={saveEdit}
                      onMouseDown={(e) => handleMouseDown(row, col, e)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onDoubleClick={() => handleDoubleClick(row, col)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Spreadsheet;
