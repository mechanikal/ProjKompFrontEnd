import React from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { motion } from "framer-motion";
import { springTransition } from "../utils/MotionUtils";

type TimetableGridProps = GridProps & {
  showBin?: boolean;
  dayLabels?: Array<{
    label: string;
    termNumber?: string;
  } | null>;
};

const TimetableGrid: React.FC<TimetableGridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin, showBin = true, dayLabels = [] }) => {
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
  const gridTemplateRows = `${headerHeight}px ${dayRows.map((row) => `${row.heightPx}px`).join(" ")}`;
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
      {hours.map((hour, hourIndex) => (
        <div 
          key={`header-${hour}`} 
          className={`timetable-hour-header ${hourIndex === cols - 1 ? 'timetable-hour-header--last' : ''}`}
        >
          {hour}
        </div>
      ))}

      {/* Left column: Day headers + Grid cells */}
      {dayRows.map((row, rowIndex) => (
        <React.Fragment key={`row-${row.day}`}>
          {/* Day header for this row */}
          <div className={`timetable-day-header ${rowIndex === rows - 1 ? 'timetable-day-header--last' : ''}`}>
            <div>{row.day}</div>
            {dayLabels[rowIndex] && (
              <div className="timetable-day-header__term">
                <span className="timetable-day-header__term-label">{dayLabels[rowIndex]?.label}</span>
                {dayLabels[rowIndex]?.termNumber && (
                  <span className="timetable-day-header__term-number">{dayLabels[rowIndex]?.termNumber}</span>
                )}
              </div>
            )}
          </div>

          {/* Grid cells for this row */}
          {Array.from({ length: cols }).map((_, colIndex) => {
            const isLastCol = colIndex === cols - 1;
            const isLastRow = rowIndex === rows - 1;
            const cellClasses = [
              'timetable-cell',
              isLastCol ? 'timetable-cell--last-col' : '',
              isLastRow ? 'timetable-cell--last-row' : '',
            ].filter(Boolean).join(' ');
            
            return (
              <div 
                key={`cell-${row.day}-${colIndex}`} 
                className={cellClasses}
              />
            );
          })}
        </React.Fragment>
      ))}

      {showBin && (
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
      )}
    </motion.div>
  );
};


export default TimetableGrid;