import { getCellIndex, getCellPosition, GridProps } from "./TimeGridUtils";

export type BlockData = {
    id: number;
    col: number;
    row: number;
    subrow: number;
    x: number;
    y: number;
    hourSpan: number;
    color: string;
    text: string;
};

function isOverlapping(blockA: BlockData, blockB: BlockData) {
    if (blockA.row !== blockB.row) return false;
    const aStart = blockA.col;
    const aEnd = blockA.col + blockA.hourSpan;
    const bStart = blockB.col;
    const bEnd = blockB.col + blockB.hourSpan;

    return aStart < bEnd && bStart < aEnd;
}

export function updateBlockPosition(blocksData: BlockData[], blockId: number, newX: number, newY: number, gridProps: GridProps) {
    const cellIndex = getCellIndex(newX, newY, gridProps);
    
    return blocksData.map(block => {
        if (block.id === blockId) {
            return { ...block, col: cellIndex.col, row: cellIndex.row };
        }
        return block;
    });
}

export function recalculateBlockPostions(blocksData: BlockData[], gridProps: GridProps) {
    console.log("Recalculating block positions with gridProps:", blocksData);
    return blocksData.map(block => {
        const cellPosition = getCellPosition(block.row, block.col, gridProps);
        return { ...block, x: cellPosition.x, y: cellPosition.y + (block.subrow * gridProps.gridHeight / gridProps.rows) };
    });
}

export function recalculateBlockSubrows(blocksData: BlockData[]) {
    console.log("Recalculating block subrows based on overlaps:", blocksData);
    let newBlocksData = blocksData.map(block => ({ ...block, subrow: 0 }));
    
    for (let i = 0; i < newBlocksData.length; i++) {
        const block = newBlocksData[i];
        for (let j = 0; j < newBlocksData.length; j++) {
            if (i <= j) continue;
            const otherBlock = newBlocksData[j];

            if (isOverlapping(block, otherBlock) && block.subrow == otherBlock.subrow) {
                block.subrow = findFirstAvailableSubrow(newBlocksData, block.row, block.col, block.hourSpan);
            }
        }
    }
    return newBlocksData;
}

export function findFirstAvailableSubrow(blocksData: BlockData[], targetRow: number, targetCol: number, hourSpan: number) {
    let subrow = 0;
    while (true) {
        const overlapping = blocksData.some(block => {
            if (block.row !== targetRow || block.subrow !== subrow) return false;
            const blockStart = block.col;
            const blockEnd = block.col + block.hourSpan;
            const targetStart = targetCol;
            const targetEnd = targetCol + hourSpan;
            return targetStart < blockEnd && blockStart < targetEnd;
        });
        if (!overlapping) return subrow;
        subrow++;
    }
}

export const getGridSnappedPosition = (x: number, y: number, hourSpan: number, gridProps: GridProps) => {
        console.log("Snapping to grid. Input:", x, y);
        const cellIndex = getCellIndex(x,y,gridProps);
        console.log("x,y after snapping:", x, y, "Cell Index:", cellIndex);
        const overhang = Math.max(cellIndex.col + hourSpan - gridProps.cols, 0);
        cellIndex.col -= overhang;
        const cellPos = getCellPosition(cellIndex.row, cellIndex.col, gridProps);
        return cellPos;
    };