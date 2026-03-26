import { BlockData } from "./ClassBlockUtils";


export type CellPos = {
    row: number;
    col: number;
};

export type GridProps = {
    rows: number;
    cols: number;
    gridHeight: number;
    gridWidth: number;
    rowHeights: number[];
    StartPoint: { x: number; y: number };
};

export function recalculateOccupiedCells(blocksData: BlockData[], gridProps: GridProps) {
    const newOccupied = Array(gridProps.rows * gridProps.cols).fill(0);
    blocksData.forEach(block => {
        for (let i = 0; i < block.hourSpan; i++) {
            const index = block.row * gridProps.cols + block.col + i;
            newOccupied[index] += 1;
        }
    });

    return newOccupied;
}

export function recalculateRowHeights(blocksData: BlockData[],gridProps: GridProps) {
    let rowHeights = Array(gridProps.rows).fill(1);
    blocksData.forEach(block => {
        rowHeights[block.row] = Math.max(rowHeights[block.row], block.subrow + 1);
    });
    return rowHeights;
}


export function getCellIndex(x: number, y: number, gridProps: GridProps) {
    
    console.log("x and y are now:", x, y);
    let row = 0;
    let col;
    let sumY = 0;
    const cellSize = { x: gridProps.gridWidth / gridProps.cols, y: gridProps.gridHeight / gridProps.rows };
    console.log("x and y are now:", x, y);
    y -= gridProps.StartPoint.y;
    x -= gridProps.StartPoint.x;
    console.log("x and y are now:", x, y);
    console.log("rowHeights:", gridProps.rowHeights.length);
    for (let i = 0; i < gridProps.rowHeights.length; i++) {
       sumY += gridProps.rowHeights[i]*cellSize.y;
       console.log("i =", i, "y:", y, "sumY:", sumY);
        if (y < sumY) {
            row = i;
            break;
        }
    }
    col = Math.max(0, Math.min(Math.floor(x / cellSize.x), gridProps.cols - 1));
    console.log("Calculated cell index:", { row, col });
    return {row, col};
}

export function getCellPosition(row: number, col: number, gridProps: GridProps) {
    const cellSize = { x: gridProps.gridWidth / gridProps.cols, y: gridProps.gridHeight / gridProps.rows };
    let y = 0;
    let x = col * cellSize.x;
        

    for (let i = 0; i < row; i++) {
        y += gridProps.rowHeights[i]*cellSize.y;
    }
    return { x: gridProps.StartPoint.x + x, y: gridProps.StartPoint.y + y };
}