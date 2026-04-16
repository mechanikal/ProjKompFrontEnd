import React from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { motion } from "framer-motion";
import { springTransition } from "../utils/MotionUtils";


const TimetableGrid: React.FC<GridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
  const weekdays = ["PON", "WT", "ŚR", "CZW", "PT"];
  const dayRows = weekdays.map((day, index) => ({
    day,
    index,
    heightPx: Math.max(0, rowHeights[index] * cellSize.y),
  }));
  const visibleGridHeight = dayRows.reduce((sum, row) => sum + row.heightPx, 0);

  return (
    <div
      className="timetable-grid-wrap"
      style={{ height: `${visibleGridHeight + Bin.height + 26}px` }}
    >
    <div
      className="timetable-day-rail"
      style={{
        top: `${StartPoint.y}px`,
        height: `${visibleGridHeight}px`,
      }}
    >
      {dayRows.map((row) => (
        <div
          key={row.day}
          className="timetable-day-row"
          style={{ height: `${row.heightPx}px` }}
        >
          <span className="timetable-day-pill">{row.day}</span>
        </div>
      ))}
    </div>

    <motion.div
      layout
      transition={springTransition}
      className="timetable-grid"
      style={{
        width: `${gridWidth}px`,
        height: `${visibleGridHeight}px`,
        position: "absolute",
        left: `${StartPoint.x}px`,
        top: `${StartPoint.y}px`,
      }}
    >
      {dayRows.map((row) => (
        <div
          key={row.day}
          className="timetable-grid-row"
          style={{
            height: `${row.heightPx}px`,
            gridTemplateColumns: `repeat(${cols}, ${cellSize.x}px)`,
          }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={`${row.day}-${colIndex}`} className="timetable-cell" />
          ))}
        </div>
      ))}
    </motion.div>

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
    </div>
  );
};


export default TimetableGrid;