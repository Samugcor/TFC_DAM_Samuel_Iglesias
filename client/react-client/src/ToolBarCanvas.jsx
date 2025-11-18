import React from 'react';

// Define the available tools
export const TOOLS = {
  PAN: 'PAN', 
  TEXT: 'TEXT',
  CIRCLE: 'CIRCLE',
  RECTANGLE: 'RECTANGLE',
};

export default function Toolbar({ activeTool, setActiveTool }) {
  return (
    <div className='canvas_toolbar'>
      <button 
        onClick={() => setActiveTool(TOOLS.PAN)}
      >
        ✋ Pan 
      </button>
      <button 
        onClick={() => setActiveTool(TOOLS.TEXT)}
      >
        📝 Text
      </button>
      <button 
        onClick={() => setActiveTool(TOOLS.CIRCLE)}
      >
        ⭕ Circle
      </button>
      <button 
        onClick={() => console.log("hi")}
      >
        🔲 Rectangle
      </button>
    </div>
  );
}