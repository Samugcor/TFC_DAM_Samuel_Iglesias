import React from 'react';

export default function ColorInput({ color, onChange }) {
  console.log(color);
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