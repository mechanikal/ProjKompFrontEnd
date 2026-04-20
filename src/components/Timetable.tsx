import React, { useEffect, useMemo, useRef, useState } from "react";
import TimetableGrid from "./TimetableGrid";
import ClassBlock from "./ClassBlock";
import { BlockData, getGridSnappedPosition, updateBlockPosition, removeBlock, recalculateBlockPostions, recalculateBlockSubrows, sortBlocksByPlacement } from "../utils/ClassBlockUtils";
import { recalculateOccupiedCells, GridProps, isBinArea, getCellPosition, getRowHeightsFromOccupiedCells } from "../utils/TimeGridUtils";
import { clearSavedJsonRoot, saveBlocksAsJson } from "../utils/JsonUtils";
import { getNewBlockPosition, SpawnNewBlock } from "../utils/NewBlockUtils";
import { isNewBlockPresent } from "../utils/NewBlockUtils";
import EditBar from "./EditBar";
import { buildCurrentGridProps } from "../utils/TimetableLayoutUtils";
import { getWeekDateStrings, getWeekRangeString, getPreviousWeek, getNextWeek, getTodayDate } from "../utils/CalendarUtils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ThemeMode } from "../utils/ThemeUtils";
import { AnimatePresence, motion } from "framer-motion";
import { blockItemVariants, blockListVariants, springTransition } from "../utils/MotionUtils";
import { useScheduleData } from "../hooks/useScheduleData";
import { filterClassesForWeek, refreshScheduledBlocks } from "../utils/ScheduleDataUtils";

type TimetableProps = {
  gridProps: GridProps;
    theme: ThemeMode;
  onEditBarVisibilityChange?: (isVisible: boolean) => void;
  //todo: add initial blocks data as prop
};

const Timetable: React.FC<TimetableProps> = ({ gridProps, theme, onEditBarVisibilityChange }) => {
    const { rows, cols, gridHeight, gridWidth } = gridProps;
    const cellSize = { x: gridWidth / cols, y: gridHeight / rows };
    const [rowHeights, setRowHeights] = useState(Array(rows).fill(1));
    const [blocksData, setBlocksData] = useState<BlockData[]>([]);
    const [occupiedCells, setOccupiedCells] = useState<number[]>(Array(rows * cols).fill(0));
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(getTodayDate());
    const rightPanelRef = useRef<HTMLElement | null>(null);
    const toast = useRef<Toast>(null);

    const selectedBlock = blocksData.find(b => b.id === selectedBlockId);
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
    const [isEditModeEnabled, setIsEditModeEnabled] = useState(false);
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [boardContentWidth, setBoardContentWidth] = useState(gridWidth + 50);
    const responsiveGridWidth = Math.max(1, boardContentWidth - 50);
    const { classes: scheduleClasses, terms: scheduleTerms, isLoading: scheduleIsLoading, error: scheduleError } = useScheduleData(gridProps);
    const weekDates = useMemo(() => getWeekDateStrings(currentDate), [currentDate]);
    const dayLabels = useMemo(() => weekDates.map((dateString) => {
        const exactIndex = scheduleTerms.indexOf(dateString);
        if (exactIndex === -1) {
            return "";
        }

        const termNumber = Math.floor(exactIndex / 5) + 1;
        return `Termin ${termNumber}`;
    }), [scheduleTerms, weekDates]);
    const currentGridProps = useMemo(() => buildCurrentGridProps(gridProps, rowHeights), [gridProps, rowHeights]);
    const responsiveGridProps = useMemo(() => ({
        ...currentGridProps,
        gridWidth: responsiveGridWidth,
        Bin: {
            ...currentGridProps.Bin,
            StartPoint: {
                x: 50 + responsiveGridWidth - currentGridProps.Bin.width,
                y: currentGridProps.Bin.StartPoint.y,
            },
        },
    }), [currentGridProps, responsiveGridWidth]);
    const visibleBlocks = useMemo(() => {
        const weekFilteredBlocks = filterClassesForWeek(blocksData, weekDates);
        const newBlocks = blocksData.filter((block) => block.col === -1 && block.row === -1);

        if (!isEditModeEnabled) {
            const weekDateSet = new Set(weekDates);

            return weekFilteredBlocks.flatMap((block) => {
                const matchedDate = block.activeDates.find((date) => weekDateSet.has(date));
                if (!matchedDate) {
                    return [];
                }

                const displayRow = weekDates.indexOf(matchedDate);
                if (displayRow < 0) {
                    return [];
                }

                const position = getCellPosition(displayRow, block.col, responsiveGridProps);
                return [{
                    ...block,
                    row: displayRow,
                    x: position.x,
                    y: position.y + (block.subrow * responsiveGridProps.gridHeight / responsiveGridProps.rows),
                }];
            });
        }

        return isEditModeEnabled ? [...weekFilteredBlocks, ...newBlocks] : weekFilteredBlocks;
    }, [blocksData, isEditModeEnabled, weekDates, responsiveGridProps]);

    useEffect(() => {
        onEditBarVisibilityChange?.(selectedBlockId !== null);
    }, [onEditBarVisibilityChange, selectedBlockId]);

    useEffect(() => {
        if (!isEditModeEnabled) {
            setSelectedBlockId(null);
        }
    }, [isEditModeEnabled]);

    useEffect(() => {
        if (selectedBlockId === null) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) {
                return;
            }

            if (
                rightPanelRef.current?.contains(target) ||
                target.closest(".tt-class-block") ||
                target.closest(".p-colorpicker-panel") ||
                target.closest(".p-connected-overlay")
            ) {
                return;
            }

            setSelectedBlockId(null);
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [selectedBlockId]);

    useEffect(() => {
        setRowHeights(getRowHeightsFromOccupiedCells(occupiedCells, rows, cols));
    }, [occupiedCells, rows, cols]);

    useEffect(() => {
        const element = boardRef.current;
        if (!element) {
            return;
        }

        const updateBoardWidth = () => {
            setBoardContentWidth((previousWidth) => {
                const nextWidth = Math.max(1, element.clientWidth);
                return nextWidth === previousWidth ? previousWidth : nextWidth;
            });
        };

        updateBoardWidth();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", updateBoardWidth);
            return () => window.removeEventListener("resize", updateBoardWidth);
        }

        const observer = new ResizeObserver(updateBoardWidth);
        observer.observe(element);

        return () => observer.disconnect();
    }, [gridWidth]);

    useEffect(() => {
        setBlocksData(prev => recalculateBlockPostions(recalculateBlockSubrows(sortBlocksByPlacement(prev)), responsiveGridProps));
    }, [responsiveGridProps]);

    useEffect(() => {
        if (scheduleIsLoading) {
            return;
        }

        if (scheduleError) {
            setBlocksData([]);
            setOccupiedCells(Array(rows * cols).fill(0));
            return;
        }

        const blocksWithBin = SpawnNewBlock(refreshScheduledBlocks(scheduleClasses, scheduleTerms), responsiveGridProps.Bin);
        applyBlocksState(blocksWithBin, false);
    }, [scheduleIsLoading, scheduleClasses, scheduleTerms, scheduleError]);

    const applyBlocksState = (nextBlocks: BlockData[], persist = true) => {
        const sortedBlocks = sortBlocksByPlacement(nextBlocks);
        setBlocksData(sortedBlocks);
        setOccupiedCells(recalculateOccupiedCells(sortedBlocks, responsiveGridProps));

        if (persist) {
            saveBlocksAsJson(sortedBlocks);
        }

        return sortedBlocks;
    };

    const handleEditBlock = (updatedBlock: BlockData, options?: { silent?: boolean }) => {
        const nextBlocks = sortBlocksByPlacement(
            blocksData.map(b => (b.id === updatedBlock.id ? updatedBlock : b))
        );

        applyBlocksState(nextBlocks);

        if (!options?.silent) {
            toast.current?.show({
                severity: "success",
                summary: "Zapisano",
                detail: `Zaktualizowano blok: ${updatedBlock.text}`,
                life: 1400,
            });
        }
    };

    const deleteBlockById = (blockId: number) => {
        let nextBlocks = removeBlock(blocksData, blockId);
        if (!isNewBlockPresent(nextBlocks)) {
            nextBlocks = SpawnNewBlock(nextBlocks, responsiveGridProps.Bin);
        }

        applyBlocksState(nextBlocks);
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

    const handlePreviousWeek = () => {
        setCurrentDate((previous) => getPreviousWeek(previous));
    };

    const handleNextWeek = () => {
        setCurrentDate((previous) => getNextWeek(previous));
    };

    const handleReloadData = () => {
        clearSavedJsonRoot();
        window.location.reload();
    };

    //block handlers

    const handleBlockPickup = (blockId: number, hourSpan: number) => {
        if (!isEditModeEnabled) {
            return;
        }

        const block = blocksData.find(b => b.id === blockId);
        if (!block) return;
        if (block.col == -1 || block.row == -1){
            setBlocksData(SpawnNewBlock(blocksData,responsiveGridProps.Bin));
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

    const handleHideEditBar = () => {
        setSelectedBlockId(null);
    };

    const handleBlockDrop = (blockId: number, newX: number, newY: number, hourSpan: number) => {
        if (!isEditModeEnabled) {
            return { x: newX, y: newY };
        }

        if (isBinArea(newX,newY,responsiveGridProps)){
            let newData = removeBlock(blocksData,blockId);
            if(!isNewBlockPresent(newData)){
                newData = SpawnNewBlock(newData,responsiveGridProps.Bin);
            }
            applyBlocksState(newData);
            setSelectedBlockId(null);
            toast.current?.show({
                severity: "info",
                summary: "Przeniesiono do kosza",
                detail: `Blok #${blockId} trafil do binu.`,
                life: 1200,
            });
            return {x: getNewBlockPosition(responsiveGridProps.Bin).x, y: getNewBlockPosition(responsiveGridProps.Bin).y};
        }
        const snappedPos = getGridSnappedPosition(newX, newY + cellSize.y/2, hourSpan, responsiveGridProps);
        const newBlocksData = updateBlockPosition(blocksData, blockId, snappedPos.x, snappedPos.y, responsiveGridProps);
        let recalculatedBlocks = sortBlocksByPlacement(newBlocksData);
        if(!isNewBlockPresent(recalculatedBlocks)){
            recalculatedBlocks = SpawnNewBlock(recalculatedBlocks,responsiveGridProps.Bin);
        }
        applyBlocksState(recalculatedBlocks);
        return snappedPos;
    }

    const placedBlocksCount = visibleBlocks.filter(block => block.col !== -1 && block.row !== -1).length;

    return (
        <div className="tt-layout" style={{ position: "relative" }}>
        <ConfirmDialog />
        <Toast ref={toast} position="top-right" />

        <div className={`tt-surface ${selectedBlockId !== null ? "tt-surface--editbar-open" : "tt-surface--editbar-hidden"}`}>
            <section className="tt-left-panel">
                <div className="tt-prompt-row">
                    <Button icon="pi pi-link" rounded text className="tt-icon-btn tt-prompt-link" />
                    <InputText placeholder="Wpisz prompt" className="tt-prompt-input" />
                    <Button icon="pi pi-send" rounded text className="tt-icon-btn" />
                </div>

                <div className="tt-plan-row">
                    <span>tryb edycji</span>
                    <label className="tt-mail-toggle" aria-label="Tryb edycji">
                        <input
                            type="checkbox"
                            checked={isEditModeEnabled}
                            onChange={(event) => setIsEditModeEnabled(event.target.checked)}
                        />
                        <span className="tt-mail-toggle-track" aria-hidden="true">
                            <span className="tt-mail-toggle-thumb" />
                        </span>
                    </label>
                </div>

                <div className="tt-plan-row">
                    <span>powiadomienia e-mail</span>
                    <label className="tt-mail-toggle" aria-label="Powiadomienia e-mail">
                        <input
                            type="checkbox"
                            checked={emailNotificationsEnabled}
                            onChange={(event) => setEmailNotificationsEnabled(event.target.checked)}
                        />
                        <span className="tt-mail-toggle-track" aria-hidden="true">
                            <span className="tt-mail-toggle-thumb" />
                        </span>
                    </label>
                </div>

                <div className="tt-plan-row tt-plan-tags-row">
                    <span>plany:</span>
                    <span className="tt-plan-chip">nazwa grupy</span>
                    <span className="tt-plan-chip">nazwa grupy</span>
                    <Button icon="pi pi-plus" text rounded className="tt-icon-btn tt-chip-add-btn" />
                    <div className="tt-plan-row-spacer" />
                    <Button icon="pi pi-refresh" rounded outlined className="tt-icon-btn tt-refresh-btn" onClick={handleReloadData} />
                </div>

                <motion.div
                    ref={boardRef}
                    layout
                    transition={springTransition}
                    className="tt-board"
                    style={{ position: "relative", width: "100%", minWidth: 0 }}
                >
                    <TimetableGrid
                        rows={rows}
                        cols={cols}
                        gridHeight={gridHeight}
                        gridWidth={responsiveGridProps.gridWidth}
                        rowHeights={rowHeights}
                        StartPoint={responsiveGridProps.StartPoint}
                        Bin={responsiveGridProps.Bin}
                        showBin={isEditModeEnabled}
                        dayLabels={dayLabels}
                    />
                    <motion.div
                        className="tt-block-layer"
                        variants={blockListVariants}
                        initial={false}
                        animate="animate"
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {visibleBlocks.map((block) => {
                                const isNewClassBlock = block.col === -1 && block.row === -1;

                                if (isNewClassBlock && !isEditModeEnabled) {
                                    return null;
                                }

                                return (
                                    <ClassBlock
                                        gridProps={responsiveGridProps}
                                        handlePickup={handleBlockPickup}
                                        handleDrop={handleBlockDrop}
                                        isEditModeEnabled={isEditModeEnabled}
                                        key={block.id}
                                        theme={theme}
                                        blockData={block}
                                        variants={blockItemVariants}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {!isEditModeEnabled && (
                    <div className="tt-bottom-row">
                        <div className="tt-bottom-nav">
                            <Button icon="pi pi-chevron-left" rounded outlined className="tt-nav-btn" aria-label="Poprzedni tydzień" onClick={handlePreviousWeek} />
                            <span className="tt-date-pill">{getWeekRangeString(currentDate)}</span>
                            <Button icon="pi pi-chevron-right" rounded outlined className="tt-nav-btn" aria-label="Następny tydzień" onClick={handleNextWeek} />
                        </div>

                        <Button label="pobierz pdf" icon="pi pi-download" className="tt-download-btn" />
                    </div>
                )}

                {isEditModeEnabled && <div className="tt-active-count">Aktywne bloki: {placedBlocksCount}</div>}
                {scheduleError && <div className="tt-active-count">Błąd danych: {scheduleError}</div>}
            </section>

            <aside ref={rightPanelRef} className="tt-right-panel">
            <EditBar
                blockData={selectedBlock}
                onSave={handleEditBlock}
                onHide={handleHideEditBar}
                onDelete={handleDeleteRequest}
            />
            </aside>
        </div>
        </div>
    );
};

export default Timetable;
