import React, { useEffect, useMemo, useRef, useState } from "react";
import TimetableGrid from "./TimetableGrid";
import ClassBlock from "./ClassBlock";
import { BlockData, getGridSnappedPosition, updateBlockPosition, removeBlock, recalculateBlockPostions, recalculateBlockSubrows, sortBlocksByPlacement } from "../utils/ClassBlockUtils";
import { recalculateOccupiedCells, GridProps, isBinArea, getRowHeightsFromOccupiedCells } from "../utils/TimeGridUtils";
import { jsonToBlockData, JsonData } from "../utils/JsonUtils";
import { getNewBlockPosition, SpawnNewBlock } from "../utils/NewBlockUtils";
import { isNewBlockPresent } from "../utils/NewBlockUtils";
import EditBar from "./EditBar";
import { buildCurrentGridProps } from "../utils/TimetableLayoutUtils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

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
    const toast = useRef<Toast>(null);

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

        toast.current?.show({
            severity: "success",
            summary: "Zapisano",
            detail: `Zaktualizowano blok: ${updatedBlock.text}`,
            life: 1400,
        });
    };

    const deleteBlockById = (blockId: number) => {
        let nextBlocks = removeBlock(blocksData, blockId);
        if (!isNewBlockPresent(nextBlocks)) {
            nextBlocks = SpawnNewBlock(nextBlocks, currentGridProps.Bin);
        }

        setBlocksData(sortBlocksByPlacement(nextBlocks));
        setOccupiedCells(recalculateOccupiedCells(nextBlocks, currentGridProps));
        setSelectedBlockId(null);

        toast.current?.show({
            severity: "warn",
            summary: "Usunieto blok",
            detail: `Blok #${blockId} zostal usuniety.`,
            life: 1500,
        });
    };

    const handleDeleteRequest = (blockId: number) => {
        confirmDialog({
            message: "Czy na pewno chcesz usunac ten blok?",
            header: "Potwierdz usuniecie",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => deleteBlockById(blockId),
        });
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
            toast.current?.show({
                severity: "info",
                summary: "Przeniesiono do kosza",
                detail: `Blok #${blockId} trafil do binu.`,
                life: 1200,
            });
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

    const placedBlocksCount = blocksData.filter(block => block.col !== -1 && block.row !== -1).length;
    const hours = Array.from({ length: cols }, (_, index) => `${8 + index}:00`);
    const boardWidth = currentGridProps.StartPoint.x + currentGridProps.gridWidth;
    const hoursStyle = {
        marginLeft: `${currentGridProps.StartPoint.x}px`,
        width: `${currentGridProps.gridWidth}px`,
        gridTemplateColumns: `repeat(${cols}, ${currentGridProps.gridWidth / cols}px)`,
    } as const;

    return (
        <div className="tt-layout" style={{ position: "relative" }}>
        <ConfirmDialog />
        <Toast ref={toast} position="top-right" />

        <div className="tt-surface">
            <section className="tt-left-panel">
                <div className="tt-prompt-row">
                    <Button icon="pi pi-link" rounded text className="tt-icon-btn tt-prompt-link" />
                    <InputText placeholder="enter prompt" className="tt-prompt-input" />
                    <Button icon="pi pi-send" rounded text className="tt-icon-btn" />
                </div>

                <div className="tt-plan-row">
                    <span>powiadomienia e-mail</span>
                    <span className="tt-mail-toggle" aria-hidden="true"><span /></span>
                </div>

                <div className="tt-plan-row tt-plan-tags-row">
                    <span>plany:</span>
                    <Tag value="nazwa grupy" severity="info" />
                    <Tag value="nazwa grupy" severity="info" />
                    <Button icon="pi pi-plus" text rounded className="tt-icon-btn" />
                    <div className="tt-plan-row-spacer" />
                    <Button icon="pi pi-refresh" rounded outlined className="tt-icon-btn tt-refresh-btn" />
                </div>

                <div className="tt-hours-row" style={hoursStyle}>
                    {hours.map((hour) => (
                        <span key={hour} className="tt-hour-pill">{hour}</span>
                    ))}
                </div>

                <div className="tt-board" style={{ position: "relative", width: `${boardWidth}px` }}>
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
                </div>

                <div className="tt-bottom-row">
                    <div className="tt-bottom-nav">
                        <Button icon="pi pi-replay" rounded outlined className="tt-nav-btn" />
                        <span className="tt-date-pill">25.01-1.02</span>
                        <Button icon="pi pi-share-alt" rounded outlined className="tt-nav-btn" />
                    </div>

                    <Button label="pobierz pdf" icon="pi pi-download" className="tt-download-btn" />
                </div>

                <div className="tt-active-count">Aktywne bloki: {placedBlocksCount}</div>
            </section>

            <aside className="tt-right-panel">
            <EditBar
                blockData={selectedBlock}
                onChange={handleEditBlock}
                onHide={() => setSelectedBlockId(null)}
                onDelete={handleDeleteRequest}
            />
            </aside>
        </div>
        </div>
    );
};

export default Timetable;