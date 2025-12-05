import React from 'react';
import '../styles/ToolBarCanvas.css';
import icon_circle from '../assets/circle.svg';
import icon_download from '../assets/download.svg';
import icon_rectangle from '../assets/rectangle-horizontal.svg';
import icon_minus from '../assets/minus.svg';
import icon_mouse_pointer from '../assets/mouse-pointer.svg';
import icon_hand from '../assets/hand.svg';
import icon_escribir from '../assets/type.svg';
import icon_evento from '../assets/map-pin-plus-inside.svg';
import { useState } from 'react';
import WorkingOnIt from './WorkingOnIt';

// Define the available tools
export const TOOLS = {
  SELECT: {KEY: 'SELECT', LABEL: 'Select', ICON: icon_mouse_pointer}, 
  PAN: { KEY: 'PAN', LABEL: 'Pan', ICON: icon_hand }, 
  TEXT: {KEY: 'TEXT', LABEL: 'Text', ICON: icon_escribir},
  CIRCLE: {KEY: 'CIRCLE', LABEL: 'Circle', ICON: icon_circle},
  RECTANGLE: {KEY: 'RECTANGLE', LABEL: 'Rectangle', ICON: icon_rectangle},
  NEWEVENT: { KEY: 'NEWEVENT', LABEL: 'Create Event', ICON: icon_evento },
};

export default function Toolbar({ activeTool, setActiveTool }) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  return (
    <>
    <div className='canvas_toolbar'>
      <div className='canvas_toolgroup'>
        {Object.values(TOOLS).map(TOOL => (
          <button
            key={TOOL.KEY}
            onClick={() => setActiveTool(TOOL.KEY)}
            className={`canvas_tool ${activeTool === TOOL.KEY ? 'active' : ''}`}
            title={TOOL.LABEL}
          >
            <img src={TOOL.ICON} alt={TOOL.LABEL} />
          </button>
        ))}
      </div>
      <div className='canvas_toolgroup'>
        <button
          onClick={() => setShowDownloadModal(true)}
          className='canvas_tool'
          title='Download'>
            <img src={icon_download} alt="download" />
        </button>
      </div>
      
    </div>
    {showDownloadModal && (
      <WorkingOnIt
        onClose={() => setShowDownloadModal(false)}
      />
    )}
    </>
  );
}