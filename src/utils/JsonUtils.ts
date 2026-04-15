import { BlockData } from "./ClassBlockUtils";
import { GridProps, getCellPosition } from "./TimeGridUtils";

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
    const col = json.start - 8;
    const row = json.day;
    const position = getCellPosition(row, col, gridProps);
    const result: BlockData = {
        id: 0,
        col,
        row,
        subrow: 0,
        x: position.x,
        y: position.y,
        hourSpan: json.length,
        color: "#" + json.color.toString(16).padStart(6, "0"),
        text: json.info.name
    };
    return result;
}
