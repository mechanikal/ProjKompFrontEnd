import { useState } from "react";
import Block from "./components/ClassBlock";
import Timetable from "./components/Timetable";

function App() {
  const gridProps = {
    rows: 7,
    cols: 12,
    gridWidth: window.innerWidth * 0.75,
    gridHeight: window.innerWidth * 0.75/2,
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