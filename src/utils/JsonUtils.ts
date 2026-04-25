import { BlockData } from "./ClassBlockUtils";
import { GridProps, getCellPosition } from "./TimeGridUtils";

export type JsonData = {
    info: {
        terms: Array<number | "x1" | "x2">,
        extra: string,
        name: string,
    },
    reference: string,
    color: number,
    start: number,
    length: number,
    day: number
};

export type JsonRoot = {
    name: string;
    classes: JsonData[];
};

const LOCAL_STORAGE_KEY = "projkomp.timetable.json";
const DEFAULT_TIMETABLE_NAME = "Lokalny plan";

function normalizeTerms(terms: unknown): number[] {
    if (!Array.isArray(terms)) {
        return [];
    }

    const validTerms = terms
        .filter((term): term is number => Number.isInteger(term) && term >= 1 && term <= 15)
        .sort((a, b) => a - b);

    return [...new Set(validTerms)];
}

function normalizeTermMode(terms: unknown): "x1" | "x2" {
    if (!Array.isArray(terms)) {
        return "x1";
    }

    return terms.includes("x2") ? "x2" : "x1";
}

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
        text: json.info.name,
        note: "",
        extraInfo: json.info.extra,
        terms: normalizeTerms(json.info.terms),
        termMode: normalizeTermMode(json.info.terms),
        reference: json.reference,
        activeDates: []
    };
    return result;
}

function parseJsonRoot(value: string | null): JsonRoot | null {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed?.classes)) {
            return null;
        }

        return {
            name: typeof parsed.name === "string" ? parsed.name : DEFAULT_TIMETABLE_NAME,
            classes: parsed.classes as JsonData[]
        };
    } catch {
        return null;
    }
}

function getLocalRoot(): JsonRoot | null {
    if (typeof window === "undefined") {
        return null;
    }

    return parseJsonRoot(window.localStorage.getItem(LOCAL_STORAGE_KEY));
}

export async function loadJsonRoot(): Promise<JsonRoot> {
    const localRoot = getLocalRoot();
    if (localRoot) {
        return localRoot;
    }

    const response = await fetch("/6i-io1.json");
    const loaded = await response.json();

    const fromFile: JsonRoot = {
        name: typeof loaded?.name === "string" ? loaded.name : DEFAULT_TIMETABLE_NAME,
        classes: Array.isArray(loaded?.classes) ? loaded.classes : []
    };

    saveJsonRoot(fromFile);
    return fromFile;
}

export function saveJsonRoot(root: JsonRoot) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(root));
}

export function clearSavedJsonRoot() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function saveBlocksAsJson(blocks: BlockData[], timetableName = DEFAULT_TIMETABLE_NAME) {
    const placedBlocks = blocks.filter(block => block.col >= 0 && block.row >= 0);

    const classes = placedBlocks.map((block) => {
        const normalizedColor = Number.parseInt(block.color.replace("#", ""), 16);
        const safeColor = Number.isNaN(normalizedColor) ? 0 : normalizedColor;
        const fallbackReference = `block-${block.id}`;

        return {
            info: {
                terms: [...block.terms, block.termMode],
                extra: block.extraInfo,
                name: block.text,
            },
            reference: block.reference || fallbackReference,
            color: safeColor,
            start: block.col + 8,
            length: block.hourSpan,
            day: block.row
        } satisfies JsonData;
    });

    saveJsonRoot({
        name: timetableName,
        classes
    });
}
