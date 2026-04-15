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
  blockData: { id: blockId, x, y, hourSpan, color, text },
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
      className="tt-class-block"
      style={{
        position: "absolute",
        width: cellSize.x * hourSpan - 2,
        height: cellSize.y - 2,
        backgroundColor: color,
        color: "#f4f8ff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        left: position.x + 1,
        top: position.y + 1,
        cursor: isDragging ? "grabbing" : "grab",
        borderRadius: 4,
        userSelect: "none",
        boxShadow: isDragging ? "0 0 0 1px rgba(255,255,255,0.35)" : "0 1px 10px rgba(0,0,0,0.35)",
        transition: isDragging ? "none" : "box-shadow 0.2s, filter 0.2s",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.2px",
        textAlign: "center",
        padding: "2px 8px",
        filter: isDragging ? "brightness(1.06)" : "none",
      }}
      >
      <span>{text}</span>
      <small className="tt-class-sub">Sample caption</small>
    </div>
  );
}