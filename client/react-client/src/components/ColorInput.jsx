import React from 'react';

export default function ColorInput({ color, onChange }) {
  return (
    <div className="color-input_container">
      <label>Color</label>
      <input
      className='color_input'
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}