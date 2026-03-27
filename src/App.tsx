import { useState } from "react";
import Block from "./components/ClassBlock";
import Timetable from "./components/Timetable";

function App() {
  const gridProps = {
    rows: 7,
    cols: 12,
    gridHeight: 500,
    gridWidth: 700,
    rowHeights: [1, 1, 1, 1, 1, 1, 1],
    StartPoint: { x: 100, y: 100 },
    Bin: {
      StartPoint: {x:0,y:600},
      height: 150,
      width: 1000,
    } 
  };

  return (
    <div style={{ padding: "20px"}}>
      <h1>Timetable App</h1>
      <Timetable gridProps={gridProps} />
    </div>
  );
}

export default App;