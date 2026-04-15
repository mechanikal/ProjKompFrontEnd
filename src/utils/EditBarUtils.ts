import { BlockData } from "./ClassBlockUtils";

export function cloneBlockData(blockData?: BlockData | null): BlockData | null {
	if (!blockData) {
		return null;
	}

	return { ...blockData };
}

export function hasDraftChanges(base?: BlockData | null, draft?: BlockData | null): boolean {
	if (!base || !draft) {
		return false;
	}

	return (
		base.text !== draft.text ||
		base.hourSpan !== draft.hourSpan ||
		base.color !== draft.color ||
		base.note !== draft.note
	);
}
