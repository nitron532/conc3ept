import { Handle, Position } from '@xyflow/react';
import {useState, useEffect} from "react"
import {Outlet, useNavigate} from "react-router-dom"
import { useSelectedItemsStore } from '../states/SelectedItemsStore';

export default function CustomNode({data}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [selected, setSelected] = useState(false)
  const defaultBackgroundColor = selected ? '#4f84db' : '#1f1f1f'
  const addSelectedItem = useSelectedItemsStore(state => state.addItem);
  const removeSelectedItem = useSelectedItemsStore(state => state.removeItem);
  const selectedItems = useSelectedItemsStore(state => state.selectedItems);

  const defaultStyle = {
        borderRadius: '12px',
        background: defaultBackgroundColor,
        border: '1px solid #ddd',
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
    background: '#a7b6cf'
  }
  
  useEffect(()=>{
    let found = false;
    for(const node of selectedItems){
      if(data.label === node.label){
        found = true;
        break;
      }
    }
    setSelected(found)
  },[selectedItems])



  const handleClickLink = (event) => {
    if(!event.ctrlKey && data.level === "q"){
      setQuestion(data)
      //TODO want to navigate to oldrepo itself to that specific question of qID
      //want to do pdf preview? or just a component that pops up
    }
    else if(!event.ctrlKey && data.level !== "t"){
      const courseId = data.courseId;
      const conceptId = data.id;
      navigate(`${encodeURIComponent(data.label)}`, {
        state: {courseId, conceptId}  
      });
    }
    else if(!event.ctrlKey && data.level === "t"){
      const courseId = data.courseId;
      const parentConceptId = data.id;
      const conceptLevel = data.label.substring(data.label.lastIndexOf(" ")+1);
      navigate(`${encodeURIComponent(conceptLevel)}`,{
        state: {courseId, parentConceptId, conceptLevel}
      });
    }
  };
  const handleClickNode = (event) =>{
    if(event.ctrlKey && !selected && data.level !== "l"){
      addSelectedItem(data)
      setSelected(true);
    }
    else if (event.ctrlKey && selected && data.level !== "l"){
      removeSelectedItem(data);
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
