import { useState, useEffect } from "react";
import { BlockData } from "../utils/ClassBlockUtils";
import { GridProps } from "../utils/TimeGridUtils";
import { getClassDisplayColor, getReadableTextColor, ThemeMode } from "../utils/ThemeUtils";
import { motion, Variants } from "framer-motion";
import { blockItemVariants, springTransition } from "../utils/MotionUtils";

type BlockProps = {
  handleDrop: (blockId: number, x: number, y: number, hourSpan: number) => {x: number, y: number};
  handlePickup: (blockId: number, hourSpan: number) => void;
  blockData: BlockData;
  gridProps: GridProps;
  theme: ThemeMode;
  variants?: Variants;
};

export default function Block({
  blockData: { id: blockId, x, y, hourSpan, color, text },
  gridProps: { gridWidth, gridHeight, cols, rows },
  handleDrop,
  handlePickup,
  theme,
  variants,

}: BlockProps) {
  const VISUAL_OFFSET_X = 8;
  const VISUAL_OFFSET_Y = 8;
  const BLOCK_WIDTH_ADJUST = -4;
  const BLOCK_HEIGHT_ADJUST = -4;
  const [position, setPosition] = useState({ x: x, y: y });
  const [isDragging, setIsDragging] = useState(false);
  const cellSize = { x: gridWidth /cols, y: gridHeight / rows };
  const classDisplayColor = getClassDisplayColor(color, theme);
  const classTextColor = getReadableTextColor(classDisplayColor);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x, y });
    }
  }, [x, y, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.pageX - position.x;
    const startY = e.pageY - position.y;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.pageX - startX,
        y: e.pageY - startY,
      });
    };
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const finalX = e.pageX - startX;
      const finalY = e.pageY - startY;
      
      handlePickup(blockId, hourSpan);
      setPosition(handleDrop(blockId, finalX, finalY, hourSpan));
      

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <motion.div
      layout={!isDragging}
      transition={isDragging ? { duration: 0 } : springTransition}
      variants={variants ?? blockItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={isDragging ? undefined : { scale: 1.02 }}
      whileTap={isDragging ? undefined : { scale: 0.98 }}
      onMouseDown={handleMouseDown}
      className="tt-class-block"
      style={{
        position: "absolute",
        width: Math.max(1, Math.round(cellSize.x * hourSpan) + BLOCK_WIDTH_ADJUST),
        height: Math.max(1, Math.round(cellSize.y) + BLOCK_HEIGHT_ADJUST),
        backgroundColor: classDisplayColor,
        color: classTextColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        left: Math.round(position.x) + VISUAL_OFFSET_X,
        top: Math.round(position.y) + VISUAL_OFFSET_Y,
        cursor: isDragging ? "grabbing" : "grab",
        borderRadius: 4,
        userSelect: "none",
        boxShadow: isDragging ? "var(--class-shadow-drag)" : "var(--class-shadow-rest)",
        transition: isDragging
          ? "none"
          : "left 240ms ease, top 240ms ease, width 240ms ease, height 240ms ease, box-shadow 200ms ease, filter 200ms ease",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.2px",
        textAlign: "center",
        padding: "6px 10px",
        filter: isDragging ? "brightness(1.06)" : "none",
        overflow: "hidden",
      }}
      >
      <span>{text}</span>
      <small className="tt-class-sub">Sample caption</small>
    </motion.div>
  );
}