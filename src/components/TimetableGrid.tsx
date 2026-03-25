import React, { useRef, useState } from "react";
import { GridProps } from "../utils/TimeGridUtils";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };

  const gridTemplateRows = rowHeights.map(height => `${height*cellSize.y}px`).join(' ');

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize.x}px)`,
        gridTemplateRows: gridTemplateRows,
        position: "absolute",
        left: `${StartPoint.x}px`,
        top: `${StartPoint.y}px`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "lightgray",
            border: "1px solid #999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         {(i%cols + 8)}
        </div>
      ))}
    </div>
  );
};


export default TimetableGrid;