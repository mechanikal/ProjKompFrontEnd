import React from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { motion } from "framer-motion";
import { springTransition } from "../utils/MotionUtils";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
  const weekdays = ["PON", "WT", "ŚR", "CZW", "PT"];
  const hours = Array.from({ length: cols }, (_, index) => `${8 + index}:00`);
  
  const dayRows = weekdays.map((day, index) => ({
    day,
    index,
    heightPx: Math.max(0, rowHeights[index] * cellSize.y),
  }));
  
  const visibleGridHeight = dayRows.reduce((sum, row) => sum + row.heightPx, 0);
  const headerHeight = Math.max(24, Math.round(cellSize.y * 0.65));
  
  // CSS Grid template: first row = header, first col = days, rest = grid cells
  const gridTemplateRows = `${headerHeight}px repeat(${rows}, 1fr)`;
  const gridTemplateColumns = `50px repeat(${cols}, ${cellSize.x}px)`;

  return (
    <motion.div
      layout
      transition={springTransition}
      className="timetable-unified-container"
      style={{
        display: "grid",
        gridTemplateRows: gridTemplateRows,
        gridTemplateColumns: gridTemplateColumns,
        gap: 0,
        width: `${50 + gridWidth}px`,
        height: `${headerHeight + visibleGridHeight}px`,
      }}
    >
      {/* Top-left corner (empty cell) */}
      <div className="timetable-corner-cell" />

      {/* Top row: Hour headers */}
      {hours.map((hour) => (
        <div key={`header-${hour}`} className="timetable-hour-header">
          {hour}
        </div>
      ))}

      {/* Left column: Day headers + Grid cells */}
      {dayRows.map((row) => (
        <React.Fragment key={`row-${row.day}`}>
          {/* Day header for this row */}
          <div className="timetable-day-header">
            {row.day}
          </div>

          {/* Grid cells for this row */}
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div 
              key={`cell-${row.day}-${colIndex}`} 
              className="timetable-cell"
            />
          ))}
        </React.Fragment>
      ))}

      {/* Bin (positioned absolutely within the grid container) */}
      <motion.div
        layout
        transition={springTransition}
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
      </motion.div>
    </motion.div>
  );
};


export default TimetableGrid;