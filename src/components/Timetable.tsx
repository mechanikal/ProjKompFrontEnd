import React, { useRef, useState, useEffect } from "react";
import TimetableGrid from "./TimetableGrid";
import ClassBlock from "./ClassBlock";
import { BlockData, recalculateBlockPostions, recalculateBlockSubrows, getGridSnappedPosition, updateBlockPosition } from "../utils/ClassBlockUtils";
import { recalculateOccupiedCells, GridProps } from "../utils/TimeGridUtils";
import { jsonToBlockData, JsonData } from "../utils/JsonUtils";

type TimetableProps = {
  gridProps: GridProps;
  //todo: add initial blocks data as prop
};

const Timetable: React.FC<TimetableProps> = ({ gridProps }) => {
    const { rows, cols, gridHeight, gridWidth, StartPoint } = gridProps;
    const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
    const [rowHeights, setRowHeights] = useState(Array(rows).fill(1));
    const [blocksData, setBlocksData] = useState<BlockData[]>([]);
    const [occupiedCells, setOccupiedCells] = useState<number[]>(Array(rows * cols).fill(0));

    const currentGridProps = { ...gridProps, rowHeights };

    // read blocks data from json file
    useEffect(() => {
        fetch('/6i-io1.json')
            .then(res => res.json())
            .then((json) => {
                const classItems = Array.isArray(json)
                    ? json
                    : Array.isArray(json?.classes)
                        ? json.classes
                        : [];

                const blocks = classItems.map((data: JsonData, index: number) => {
                    const block = jsonToBlockData(data, gridProps);
                    block.id = index;
                    return { ...block, id: index };
                });

                setBlocksData(blocks);
                setOccupiedCells(recalculateOccupiedCells(blocks, currentGridProps));
            })
            .catch(err => console.error(err));

    }, []);

    // recalculate propererties after block move

    useEffect(() => {
        setRowHeights(prev => {
            const newHeights = [...prev];
            for (let row = 0; row < rows; row++) {
                const maxOccupied = Math.max(...occupiedCells.slice(row * cols, (row + 1) * cols));
                newHeights[row] = Math.max(1, maxOccupied);
            }
            return newHeights;
        });
    }, [occupiedCells, rows, cols]);

    useEffect(() => {
        setBlocksData(prev => recalculateBlockSubrows(prev));
        setBlocksData(prev => recalculateBlockPostions(prev, currentGridProps));
    }, [occupiedCells, rowHeights]);

    //block handlers

    const handleBlockPickup = (blockId: number, hourSpan: number) => {
        const block = blocksData.find(b => b.id === blockId);
        if (!block) return;

        setOccupiedCells(prev => {
            const newArr = [...prev];
            newArr[block.row * cols + block.col] -= 1;
            for (let i = 1; i < hourSpan; i++) {
                newArr[block.row * cols + block.col + i] -= 1;
            }
            return newArr;
        });
    }

    const handleBlockDrop = (blockId: number, newX: number, newY: number, hourSpan: number) => {
        const snappedPos = getGridSnappedPosition(newX + (cellSize.x / 2), newY + (cellSize.y / 2), hourSpan, currentGridProps);
        const newBlocksData = updateBlockPosition(blocksData, blockId, snappedPos.x, snappedPos.y, currentGridProps);
        setOccupiedCells(recalculateOccupiedCells(newBlocksData, currentGridProps));
        const recalculatedBlocks = recalculateBlockPostions(newBlocksData, currentGridProps);
        setBlocksData(recalculatedBlocks);
        return { x: recalculatedBlocks[blockId].x, y: recalculatedBlocks[blockId].y };
    }

    return (
        <div style={{ position: "relative" }}>
        <TimetableGrid rows={rows} cols={cols} gridHeight={gridHeight} gridWidth={gridWidth} rowHeights={rowHeights} StartPoint={StartPoint} />
        {blocksData.map((block) => (
            <ClassBlock
                gridProps={gridProps}
                handlePickup={handleBlockPickup}
                handleDrop={handleBlockDrop}
                key={block.id}
                blockData={block}
            />
        ))}
        </div>
    );
};

export default Timetable;