import React from "react";
import { GridProps } from "../utils/TimeGridUtils";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
  const weekdays = ["MON", "TUE", "WEN", "THD", "FRI", "SAT", "SUN"];

  const gridTemplateRows = rowHeights.map(height => `${height*cellSize.y}px`).join(' ');
  return (
    <div className="timetable-grid-wrap" style={{ height: `${gridHeight + Bin.height + 26}px` }}>
    <div className="timetable-day-rail" style={{ top: `${StartPoint.y}px` }}>
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
      <span className="timetable-bin-title">BIN</span>
      <span className="timetable-bin-subtitle">drop block to delete</span>
    </div>
    </div>
  );
};


export default TimetableGrid;