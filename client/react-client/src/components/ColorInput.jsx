import React from 'react';

export default function ColorInput({ color, onChange }) {
  return (
    <>
      <label>Color</label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}