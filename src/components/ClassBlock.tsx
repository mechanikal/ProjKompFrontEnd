import { useState, useEffect } from "react";
import { BlockData } from "../utils/ClassBlockUtils";
import { GridProps } from "../utils/TimeGridUtils";

type BlockProps = {
  handleDrop: (blockId: number, x: number, y: number, hourSpan: number) => {x: number, y: number};
  handlePickup: (blockId: number, hourSpan: number) => void;
  blockData: BlockData;
  gridProps: GridProps;
};

export default function Block({
  blockData: { id: blockId, col, row, subrow, x, y, hourSpan, color, text },
  gridProps: { gridWidth, gridHeight, cols, rows },
  handleDrop,
  handlePickup

}: BlockProps) {
  const [position, setPosition] = useState({ x: x, y: y });
  const [isDragging, setIsDragging] = useState(false);
  const cellSize = { x: gridWidth /cols, y: gridHeight / rows };

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
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        width: cellSize.x * hourSpan,
        height: cellSize.y,
        backgroundColor: color,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
        borderRadius: 8,
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: isDragging ? "none" : "box-shadow 0.2s",
        fontSize: "10px"
      }}
      >
      {text}
    </div>
  );
}