import { BlockData } from "./ClassBlockUtils";


export type CellPos = {
    row: number;
    col: number;
};

export type BinData = {
    StartPoint: { x: number; y: number };
    height: number;
    width: number;
}

export type GridProps = {
    rows: number;
    cols: number;
    gridHeight: number;
    gridWidth: number;
    rowHeights: number[];
    StartPoint: { x: number; y: number };
    Bin: BinData;
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
    console.log("x,y: ",x,y)
    let row = 0;
    let col;
    let sumY = 0;
    const cellSize = { x: gridProps.gridWidth / gridProps.cols, y: gridProps.gridHeight / gridProps.rows };
    y -= gridProps.StartPoint.y;
    x -= gridProps.StartPoint.x;
    console.log("x,y after startpoit: ",x,y)
    console.log("cellsize: ",cellSize)
    for (let i = 0; i < gridProps.rowHeights.length; i++) {
       sumY += gridProps.rowHeights[i]*cellSize.y;
        if (y < sumY) {
            row = i;
            break;
        }
    }
    console.log("x/size:",x/cellSize.x)
    col = Math.max(0, Math.min(Math.round(x / cellSize.x), gridProps.cols - 1));
    console.log("row,col",row,col)
    return {row, col};
}

//todo: implement blocks bin
export function isBinArea(x:number,y:number,gridProps:GridProps){
    const binStartPoint = gridProps.Bin.StartPoint;
    const binDim = {x:gridProps.Bin.width, y:gridProps.Bin.height}
    if(x > binStartPoint.x && x < binStartPoint.x + binDim.x){
        if(y > binStartPoint.y && y < binStartPoint.y + binDim.y){
            return true;
        }
    }
    return false;
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