function Cell({ cell, displayValue, isSelected, isActive, isEditing, editValue, onEditChange, onEditKeyDown, onEditBlur, ...events }) {
  let className = 'cell';
  if (isSelected) className += ' selected';
  if (isActive) className += ' active';

  const style = {
    fontWeight: cell?.bold ? 'bold' : 'normal',
    backgroundColor: cell?.bg || undefined,
  };

  // show an input box while editing otherwise show the value
  return (
    <td className={className} style={style} {...events}>
      {isEditing ? (
        <input
          autoFocus
          className="cell-input"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={onEditKeyDown}
          onBlur={onEditBlur}
        />
      ) : (
        <span>{displayValue}</span>
      )}
    </td>
  );
}

export default Cell;
