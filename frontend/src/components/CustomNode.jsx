import { Handle, Position } from '@xyflow/react';
import {useState, useEffect} from "react"
import {Link, Outlet, useNavigate} from "react-router-dom"

// should have some state in data to determine what level of nesting it's in: concept map, taxonomy, or questions view

export default function CustomNode({data}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [selected, setSelected] = useState(false)
  const defaultBackgroundColor = selected ? '#1f1f' : '#1f1f1f'
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
    setSelected(data.selectedNodes.includes(data.label));
  }, [data.selectedNodes])

  const handleClickLink = (event) => {
    if(!event.ctrlKey){
      const courseId = data.courseId;
      navigate(`${encodeURIComponent(data.label)}`, {
        state: {courseId}   // pass extra data without adding to URL
      });
  }
  };
  const handleClickNode = (event) =>{
    if(event.ctrlKey && !selected){
      // if(data.level === "t"){
      //   let concept = data.label.substring(0,data.label.lastIndexOf(" ")) + "@" + data.label.substring(data.label.lastIndexOf(" ")+1);
      //   data.setSelectedNodes([... data.selectedNodes, concept])
      //   console.log(data.selectedNodes)
      // }
      // else{
        data.setSelectedNodes([...data.selectedNodes, data.label])
      // }
      setSelected(true);
    }
    else if (event.ctrlKey && selected){
      data.setSelectedNodes(data.selectedNodes.filter(label => label != data.label))
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
      {/* {data.level === "t" && <div>i am in taxonomy</div>}
      {data.level === "c" && <div>i am in conceptmap</div>} */}
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
