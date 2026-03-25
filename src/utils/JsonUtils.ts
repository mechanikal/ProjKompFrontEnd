import { BlockData } from "./ClassBlockUtils";
import { GridProps } from "./TimeGridUtils";

export type JsonData = {
    info: {
        // terms: [],
        extra: string,
        name: string,
    },
    reference: string,
    color: number,
    start: number,
    length: number,
    day: number
};

export function jsonToBlockData(json: JsonData, gridProps: GridProps): BlockData {
    const cellSize = { x: gridProps.gridWidth / gridProps.cols, y: gridProps.gridHeight / gridProps.rows };
    const result: BlockData = {
        id: 0,
        col: json.start - 8,
        row: json.day,
        subrow: 0,
        x: json.start * cellSize.x,
        y: json.day * cellSize.y,
        hourSpan: json.length,
        color: "#" + json.color.toString(16).padStart(6, "0"),
        text: json.info.name
    };
    return result;
}
