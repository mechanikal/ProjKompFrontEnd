import React, { useEffect, useMemo, useState } from "react";
import TimetableGrid from "./TimetableGrid";
import ClassBlock from "./ClassBlock";
import { BlockData, getGridSnappedPosition, updateBlockPosition, removeBlock, recalculateBlockPostions, recalculateBlockSubrows, sortBlocksByPlacement } from "../utils/ClassBlockUtils";
import { recalculateOccupiedCells, GridProps, isBinArea, getRowHeightsFromOccupiedCells } from "../utils/TimeGridUtils";
import { jsonToBlockData, JsonData } from "../utils/JsonUtils";
import { getNewBlockPosition, SpawnNewBlock } from "../utils/NewBlockUtils";
import { isNewBlockPresent } from "../utils/NewBlockUtils";
import EditBar from "./EditBar";
import { buildCurrentGridProps } from "../utils/TimetableLayoutUtils";

type TimetableProps = {
  gridProps: GridProps;
  //todo: add initial blocks data as prop
};

const Timetable: React.FC<TimetableProps> = ({ gridProps }) => {
    const { rows, cols, gridHeight, gridWidth } = gridProps;
    const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
    const [rowHeights, setRowHeights] = useState(Array(rows).fill(1));
    const [blocksData, setBlocksData] = useState<BlockData[]>([]);
    const [occupiedCells, setOccupiedCells] = useState<number[]>(Array(rows * cols).fill(0));
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

    const currentGridProps = useMemo(() => buildCurrentGridProps(gridProps, rowHeights), [gridProps, rowHeights]);
    const selectedBlock = blocksData.find(b => b.id === selectedBlockId) || null;

    useEffect(() => {
        setRowHeights(getRowHeightsFromOccupiedCells(occupiedCells, rows, cols));
    }, [occupiedCells, rows, cols]);

    useEffect(() => {
        setBlocksData(prev => recalculateBlockPostions(recalculateBlockSubrows(sortBlocksByPlacement(prev)), currentGridProps));
    }, [currentGridProps]);

    const handleEditBlock = (updatedBlock: BlockData) => {
        const nextBlocks = sortBlocksByPlacement(
            blocksData.map(b => (b.id === updatedBlock.id ? updatedBlock : b))
        );

        setBlocksData(nextBlocks);
        setOccupiedCells(recalculateOccupiedCells(nextBlocks, currentGridProps));
    };

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

                const blocksWithBin = SpawnNewBlock(blocks, currentGridProps.Bin);
                setBlocksData(sortBlocksByPlacement(blocksWithBin));
                setOccupiedCells(recalculateOccupiedCells(blocksWithBin, currentGridProps));
            })
            .catch(err => console.error(err));
            }, [gridProps]);

    //block handlers

    const handleBlockPickup = (blockId: number, hourSpan: number) => {
        const block = blocksData.find(b => b.id === blockId);
        if (!block) return;
        if (block.col == -1 || block.row == -1){
            setBlocksData(SpawnNewBlock(blocksData,currentGridProps.Bin));
            setSelectedBlockId(blockId);
            return;
        }

        setOccupiedCells(prev => {
            const newArr = [...prev];
            newArr[block.row * cols + block.col] -= 1;
            for (let i = 1; i < hourSpan; i++) {
                newArr[block.row * cols + block.col + i] -= 1;
            }
            return newArr;
        });
        setSelectedBlockId(blockId);
    }

    const handleBlockDrop = (blockId: number, newX: number, newY: number, hourSpan: number) => {
        if (isBinArea(newX,newY,currentGridProps)){
            let newData = removeBlock(blocksData,blockId);
            if(!isNewBlockPresent(newData)){
                newData = SpawnNewBlock(newData,currentGridProps.Bin);
            }
            setBlocksData(sortBlocksByPlacement(newData));
            setOccupiedCells(recalculateOccupiedCells(newData, currentGridProps));
            setSelectedBlockId(null);
            return {x: getNewBlockPosition(currentGridProps.Bin).x, y: getNewBlockPosition(currentGridProps.Bin).y};
        }
        const snappedPos = getGridSnappedPosition(newX, newY + cellSize.y/2, hourSpan, currentGridProps);
        const newBlocksData = updateBlockPosition(blocksData, blockId, snappedPos.x, snappedPos.y, currentGridProps);
        setOccupiedCells(recalculateOccupiedCells(newBlocksData, currentGridProps));
        let recalculatedBlocks = sortBlocksByPlacement(newBlocksData);
        if(!isNewBlockPresent(recalculatedBlocks)){
            recalculatedBlocks = SpawnNewBlock(recalculatedBlocks,currentGridProps.Bin);
        }
        setBlocksData(recalculatedBlocks);
        return snappedPos;
    }

    return (
        <div style={{ position: "relative" }}>
        <TimetableGrid rows={rows} cols={cols} gridHeight={gridHeight} gridWidth={gridWidth} rowHeights={rowHeights} StartPoint={currentGridProps.StartPoint} Bin={currentGridProps.Bin} />
        {blocksData.map((block) => (
            <ClassBlock
                gridProps={gridProps}
                handlePickup={handleBlockPickup}
                handleDrop={handleBlockDrop}
                key={block.id}
                blockData={block}
            />
        ))}
        {selectedBlock != null && (
            <EditBar
                blockData={selectedBlock}
                onChange={handleEditBlock}
            />
        )}
        </div>
    );
};

export default Timetable;