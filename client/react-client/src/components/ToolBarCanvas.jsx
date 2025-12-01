import React from 'react';

// Define the available tools
export const TOOLS = {
  SELECT: 'SELECT', 
  PAN: 'PAN', 
  TEXT: 'TEXT',
  CIRCLE: 'CIRCLE',
  RECTANGLE: 'RECTANGLE',
  NEWEVENT: 'NEWEVENT'
};

export default function Toolbar({ activeTool, setActiveTool }) {
  return (
    <div className='canvas_toolbar'>
      <button 
        onClick={() => setActiveTool(TOOLS.SELECT)}
      >
        👆 Select
      </button>
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
        onClick={() => setActiveTool(TOOLS.RECTANGLE)}
      >
        🔲 Rectangle
      </button>
      <button 
        onClick={() => setActiveTool(TOOLS.NEWEVENT)}
      >
        ➕ Create Event
      </button>
    </div>
  );
}