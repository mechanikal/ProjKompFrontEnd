import React from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };

  const gridTemplateRows = rowHeights.map(height => `${height*cellSize.y}px`).join(' ');
  return (
    <div className="timetable-grid-wrap">
    <div
      className="timetable-grid"
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
          className="timetable-cell"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         {(i%cols + 8)}
        </div>
      ))}
    </div>
    <Card
      className="timetable-bin"
      title="Bin"
      subTitle="Przenies tutaj, aby usunac"
      style={{
        position: "absolute",
        width: Bin.width,
        minHeight: Bin.height,
        left: Bin.StartPoint.x,
        top: Bin.StartPoint.y,
      }}
      footer={<Tag value="Drop Zone" severity="danger" />}
      >
      <p>Upusc blok na ten obszar, aby usunac go z planu.</p>
    </Card>
    </div>
  );
};


export default TimetableGrid;