import { useRef } from 'react';

function Toolbar({ isBold, onAddRow, onAddColumn, onBold, onColor, onCopy, onPaste, canPaste, onSave, onLoad }) {
  const fileInput = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) onLoad(file);
    e.target.value = ''; // so the same file can be pick agains
  }

  return (
    <div className="toolbar">
      <button onClick={onAddRow}>+ Row</button>
      <button onClick={onAddColumn}>+ Column</button>

      <span className="divider" />

      <button className={isBold ? 'pressed' : ''} onClick={onBold} title="Bold (Ctrl+B)">
        <b>B</b>
      </button>
      <label className="color-label">
        Fill
        <input type="color" defaultValue="#fff3bf" onChange={(e) => onColor(e.target.value)} />
      </label>
      <button onClick={() => onColor(null)}>No fill</button>

      <span className="divider" />

      <button onClick={onCopy}>Copy</button>
      <button onClick={onPaste} disabled={!canPaste}>Paste</button>

      <span className="divider" />

      <button onClick={onSave}>Save JSON</button>
      {/* file input is hidden, this button opens it */}
      <button onClick={() => fileInput.current.click()}>Load JSON</button>
      <input ref={fileInput} type="file" accept=".json" hidden onChange={handleFileChange} />
    </div>
  );
}

export default Toolbar;
