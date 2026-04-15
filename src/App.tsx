import { useState } from "react";
import Block from "./components/ClassBlock";
import Timetable from "./components/Timetable";
import EditBar from "./components/EditBar";
import { useEffect} from "react";

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}


function App() {
  const {width, height} = useWindowSize();
  const gridProps = {
    rows: 7,
    cols: 12,
    gridWidth: width * 0.70,
    gridHeight: width * 0.20,
    rowHeights: [1, 1, 1, 1, 1, 1, 1],
    StartPoint: { x: 0, y: 0 },
    Bin: {
      StartPoint: {x:2,y:800},
      height: 150,
      width: window.innerWidth * 0.75,
    } 
  };

  return (
    <div style={{margin:0, padding: 0}}>
      <h1>Timetable App</h1>
      <Timetable gridProps={gridProps} />
    </div>
  );
}

export default App;