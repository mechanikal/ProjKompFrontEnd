import React from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { AnimatePresence, motion } from "framer-motion";
import { springTransition, weekendRowVariants } from "../utils/MotionUtils";


type TimetableGridProps = GridProps & {
  showWeekends: boolean;
};

const TimetableGrid: React.FC<TimetableGridProps> = ({ rows, cols, gridHeight, gridWidth, rowHeights, StartPoint, Bin, showWeekends }) => {
  const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
  const weekdays = ["PON", "WT", "ŚR", "CZW", "PT", "SOB", "ND"];
  const dayRows = weekdays.slice(0, rows).map((day, index) => ({
    day,
    index,
    isWeekend: index >= 5,
    heightPx: Math.max(0, rowHeights[index] * cellSize.y),
  }));
  const visibleRows = dayRows.filter((row) => showWeekends || !row.isWeekend);
  const visibleGridHeight = visibleRows.reduce((sum, row) => sum + row.heightPx, 0);

  return (
    <motion.div
      layout
      transition={springTransition}
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
      {dayRows.filter((row) => !row.isWeekend).map((row) => (
        <motion.div
          layout
          transition={springTransition}
          key={row.day}
          className="timetable-day-row"
          style={{ height: `${row.heightPx}px` }}
        >
          <span className="timetable-day-pill">{row.day}</span>
        </motion.div>
      ))}
      <AnimatePresence initial={false}>
        {showWeekends && dayRows.filter((row) => row.isWeekend).map((row) => (
          <motion.div
            key={row.day}
            variants={weekendRowVariants}
            custom={row.heightPx}
            initial="initial"
            animate="animate"
            exit="exit"
            className="timetable-day-row timetable-day-row-weekend"
            style={{ overflow: "hidden" }}
          >
            <span className="timetable-day-pill">{row.day}</span>
          </motion.div>
        ))}
      </AnimatePresence>
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
      {dayRows.filter((row) => !row.isWeekend).map((row) => (
        <motion.div
          layout
          transition={springTransition}
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
        </motion.div>
      ))}
      <AnimatePresence initial={false}>
        {showWeekends && dayRows.filter((row) => row.isWeekend).map((row) => (
          <motion.div
            key={row.day}
            variants={weekendRowVariants}
            custom={row.heightPx}
            initial="initial"
            animate="animate"
            exit="exit"
            className="timetable-grid-row timetable-grid-row-weekend"
            style={{
              overflow: "hidden",
              gridTemplateColumns: `repeat(${cols}, ${cellSize.x}px)`,
            }}
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={`${row.day}-${colIndex}`} className="timetable-cell" />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
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
    </motion.div>
  );
};


export default TimetableGrid;