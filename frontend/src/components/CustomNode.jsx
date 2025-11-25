import { Handle, Position } from '@xyflow/react';
import {useState} from "react"
import {Link, Outlet} from "react-router-dom"
export default function CustomNode({ data }) {
  const [hover, setHover] = useState(false);
  const defaultStyle = {
        borderRadius: '12px',
        background: '#1f1f1f',
        border: '1px solid #333',
        color: '#fff',
        padding: '10px 16px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: '100px',
        minHeight: '40px',
        position: 'relative'
  }
  const hoveredStyle =
  {
    ...defaultStyle,
    background: '#085252ff'
  }

  return (
    <div
      style={
        hover ? hoveredStyle : defaultStyle
      }
      onMouseEnter={()=>{setHover(true)}}
      onMouseLeave={()=>{setHover(false)}}
    >
      <Link style ={{color: '#fff'}} to={`/conceptmap/${encodeURIComponent(data.course)}/${encodeURIComponent(data.label)}`}>{data.label}</Link> 
      <Outlet/>
    {data.layout ? (
            <>
              <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', left: '-6px' }}
              />
              <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#555', right: '-6px' }}
              />
            </>
          ) : (
            <>
              <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#555', top: '-6px' }}
              />
              <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#555', bottom: '-6px' }}
              />
            </>
          )}

    </div>
  );
}
