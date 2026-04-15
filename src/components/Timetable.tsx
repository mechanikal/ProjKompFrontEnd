import React, { useRef, useState, useEffect } from "react";
import TimetableGrid from "./TimetableGrid";
import ClassBlock from "./ClassBlock";
import { BlockData, recalculateBlockPostions, recalculateBlockSubrows, getGridSnappedPosition, updateBlockPosition, removeBlock } from "../utils/ClassBlockUtils";
import { recalculateOccupiedCells, GridProps, isBinArea, calculateHeight } from "../utils/TimeGridUtils";
import { jsonToBlockData, JsonData } from "../utils/JsonUtils";
import { getNewBlockPosition, SpawnNewBlock } from "../utils/NewBlockUtils";
import { isNewBlockPresent } from "../utils/NewBlockUtils";
import EditBar from "./EditBar";

type TimetableProps = {
  gridProps: GridProps;
  //todo: add initial blocks data as prop
};

const Timetable: React.FC<TimetableProps> = ({ gridProps }) => {
    const { rows, cols, gridHeight, gridWidth, StartPoint ,Bin } = gridProps;
    const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
    const [rowHeights, setRowHeights] = useState(Array(rows).fill(1));
    const [blocksData, setBlocksData] = useState<BlockData[]>([]);
    const [occupiedCells, setOccupiedCells] = useState<number[]>(Array(rows * cols).fill(0));
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

    const currentGridProps = { ...gridProps, rowHeights };
    const selectedBlock = blocksData.find(b => b.id === selectedBlockId) || null;

    const handleEditBlock = (updatedBlock: BlockData) => {
        setBlocksData(prev =>
            prev.map(b => (b.id === updatedBlock.id ? updatedBlock : b))
        );
        setBlocksData(prev=>{
            const newBlocks = [...prev];
            newBlocks.sort((a,b) =>{
                if (a.col == b.col){
                    return (b.hourSpan - a.hourSpan)
                }
                return (a.col - b.col);
            });
            return newBlocks;
        });
        setBlocksData(prev => recalculateBlockSubrows(prev));
        setBlocksData(prev => recalculateBlockPostions(prev, currentGridProps));
        gridProps.Bin.StartPoint.y = StartPoint.y + calculateHeight(rowHeights)*cellSize.y;
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
                
                setBlocksData(SpawnNewBlock(blocks,currentGridProps.Bin));
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
        console.log("occupied cells changed:", occupiedCells);
        setBlocksData(prev=>{
            const newBlocks = [...prev];
            newBlocks.sort((a,b) =>{
                if (a.col == b.col){
                    return (b.hourSpan - a.hourSpan)
                }
                return (a.col - b.col);
            });
            return newBlocks;
        });
        setBlocksData(prev => recalculateBlockSubrows(prev));
        setBlocksData(prev => recalculateBlockPostions(prev, currentGridProps));
        gridProps.Bin.StartPoint.y = StartPoint.y + calculateHeight(rowHeights)*cellSize.y;
    }, [occupiedCells, rowHeights,gridProps]);

    //block handlers

    const handleBlockPickup = (blockId: number, hourSpan: number) => {
        const block = blocksData.find(b => b.id === blockId);
        if (!block) return;
        if (block.col == -1 || block.row == -1){
            setBlocksData(SpawnNewBlock(blocksData,currentGridProps.Bin));
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
            console.log("binning block:",blockId);
            var newData = removeBlock(blocksData,blockId);
            if(!isNewBlockPresent(newData)){
                newData = SpawnNewBlock(newData,currentGridProps.Bin);
            }
            setBlocksData(newData);
            return {x: getNewBlockPosition(currentGridProps.Bin).x, y: getNewBlockPosition(currentGridProps.Bin).y};
        }
        const snappedPos = getGridSnappedPosition(newX, newY + cellSize.y/2, hourSpan, currentGridProps);
        console.log("snapped pos:", snappedPos);
        const newBlocksData = updateBlockPosition(blocksData, blockId, snappedPos.x, snappedPos.y, currentGridProps);
        setOccupiedCells(recalculateOccupiedCells(newBlocksData, currentGridProps));
        var recalculatedBlocks = recalculateBlockPostions(newBlocksData, currentGridProps);
        if(!isNewBlockPresent(recalculatedBlocks)){
            recalculatedBlocks = SpawnNewBlock(recalculatedBlocks,currentGridProps.Bin);
        }
        setBlocksData(recalculatedBlocks);
        const updatedBlock = recalculatedBlocks.find(b => b.id === blockId);
        if (!updatedBlock){
            return {x:0,y:0}
        }
        return { x: updatedBlock.x, y: updatedBlock.y };
    }

    return (
        <div style={{ position: "relative" }}>
        <TimetableGrid rows={rows} cols={cols} gridHeight={gridHeight} gridWidth={gridWidth} rowHeights={rowHeights} StartPoint={StartPoint} Bin={Bin} />
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