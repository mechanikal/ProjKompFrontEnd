import React from "react";
import { GridProps } from "../utils/TimeGridUtils";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
  const weekdays = ["PON", "WT", "ŚR", "CZW", "PT", "SOB", "ND"];

  const gridTemplateRows = rowHeights.map(height => `${height*cellSize.y}px`).join(' ');
  return (
    <div className="timetable-grid-wrap" style={{ height: `${gridHeight + Bin.height + 26}px` }}>
    <div
      className="timetable-day-rail"
      style={{
        top: `${StartPoint.y}px`,
        height: `${gridHeight}px`,
        gridTemplateRows,
      }}
    >
      {weekdays.slice(0, rows).map((day) => (
        <span key={day} className="timetable-day-pill">{day}</span>
      ))}
    </div>

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
        />
      ))}
    </div>

    <div
      className="timetable-bin"
      style={{
        position: "absolute",
        width: Bin.width,
        height: Bin.height,
        left: Bin.StartPoint.x,
        top: Bin.StartPoint.y,
      }}
      >
      <span className="timetable-bin-title">KOSZ</span>
      <span className="timetable-bin-subtitle">upusc blok, aby usunac</span>
    </div>
    </div>
  );
};


export default TimetableGrid;