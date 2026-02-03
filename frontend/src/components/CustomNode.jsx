import { Handle, Position } from '@xyflow/react';
import {useState, useEffect} from "react"
import {Outlet, useNavigate} from "react-router-dom"
import { useSelectedNodesStore } from '../states/SelectedNodesStore';

export default function CustomNode({data}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [selected, setSelected] = useState(false)
  const defaultBackgroundColor = selected ? '#1f1f' : '#1f1f1f'
  const selectedNodes = useSelectedNodesStore(state => state.selectedNodes);
  const addSelectedNode = useSelectedNodesStore(state => state.addNode);
  const removeSelectedNode = useSelectedNodesStore(state => state.removeNode);

  const defaultStyle = {
        borderRadius: '12px',
        background: defaultBackgroundColor,
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

  useEffect( ()=>{
    setSelected(selectedNodes.includes(data.label));
  }, [selectedNodes])

  const handleClickLink = (event) => {
    if(!event.ctrlKey && data.level !== "t"){
      const courseId = data.courseId;
      const conceptId = data.id;
      console.log(conceptId, "upperlevel nested ")
      navigate(`${encodeURIComponent(data.label)}`, {
        state: {courseId, conceptId}  
      });
    }
    else if(!event.ctrlKey && data.level === "t"){
      const courseId = data.courseId;
      const conceptId = data.id;
      const conceptLevel = data.label.substring(data.label.lastIndexOf(" ")+1);
      navigate(`${encodeURIComponent(conceptLevel)}`,{
        state: {courseId, conceptId, conceptLevel}
      });
    }
  };
  const handleClickNode = (event) =>{
    if(event.ctrlKey && !selected && data.level !== "l"){
      addSelectedNode(data.label)
      setSelected(true);
    }
    else if (event.ctrlKey && selected && data.level !== "l"){
      removeSelectedNode(data.label);
      setSelected(false);
    }
  };
  return (
    <div
      style={
        hover ? hoveredStyle : defaultStyle
      }
      onMouseEnter={()=>{setHover(true)}}
      onMouseLeave={()=>{setHover(false)}}
      onClick = {handleClickNode}
    >

      <div style = {{color: '#fff'}} onClick = {handleClickLink}>{data.label}</div>
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
