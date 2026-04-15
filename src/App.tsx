import { useMemo, useState, useEffect } from "react";
import Timetable from "./components/Timetable";

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
  const {width} = useWindowSize();
  const gridProps = useMemo(() => ({
    rows: 7,
    cols: 12,
    gridWidth: width * 0.70,
    gridHeight: width * 0.20,
    rowHeights: [1, 1, 1, 1, 1, 1, 1],
    StartPoint: { x: 0, y: 0 },
    Bin: {
      StartPoint: {x:2,y:800},
      height: 150,
      width: width * 0.75,
    } 
  }), [width]);

  return (
    <div style={{margin:0, padding: 0}}>
      <h1>Timetable App</h1>
      <Timetable gridProps={gridProps} />
    </div>
  );
}

export default App;