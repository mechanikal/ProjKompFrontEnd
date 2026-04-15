import React, { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ColorPicker } from "primereact/colorpicker";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { InputTextarea } from "primereact/inputtextarea";
import { BlockData } from "../utils/ClassBlockUtils";
import { cloneBlockData, hasDraftChanges } from "../utils/EditBarUtils";

export type EditBarData = {
    blockData?: BlockData;
    onSave: (updated: BlockData, options?: { silent?: boolean }) => void;
    onHide: () => void;
    onDelete: (blockId: number) => void;
};


const EditBar: React.FC<EditBarData> = ({ blockData, onSave, onHide, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<BlockData | null>(cloneBlockData(blockData));
  const previousIdRef = useRef<number | null>(blockData?.id ?? null);
  const previousBlockRef = useRef<BlockData | null>(cloneBlockData(blockData));
  const draftRef = useRef<BlockData | null>(cloneBlockData(blockData));

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const previousId = previousIdRef.current;
    const nextId = blockData?.id ?? null;
    const previousBlock = previousBlockRef.current;
    const currentDraft = draftRef.current;

    if (previousId !== nextId && previousBlock && currentDraft && hasDraftChanges(previousBlock, currentDraft)) {
      onSave(currentDraft, { silent: true });
    }

    const cloned = cloneBlockData(blockData);
    setDraft(cloned);
    draftRef.current = cloned;
    setIsEditing(false);
    previousIdRef.current = nextId;
    previousBlockRef.current = cloned;
  }, [blockData, onSave]);

  const disabled = !draft || !isEditing;

  const handleFieldChange = <K extends keyof BlockData>(key: K, value: BlockData[K]) => {
    if (!draft) {
      return;
    }

    setDraft({
      ...draft,
      [key]: value
    });
  };

  const handleEditOrSave = () => {
    if (!draft) {
      return;
    }

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    onSave(draft);
    setIsEditing(false);
  };

  const currentInfo = draft
    ? [
        draft.extraInfo ? `${draft.extraInfo}` : null,
      ].filter(Boolean).join("\n")
    : "";

  return (
    <div className="tt-edit-panel">
      <div className="tt-edit-header-line" />
      <div className="editbar-form">
        <div className="editbar-field">
          <label htmlFor="block-name">Nazwa przedmiotu</label>
          <InputText
            id="block-name"
            value={draft?.text ?? ""}
            disabled={disabled}
            onChange={(e) => handleFieldChange("text", e.target.value)}
          />
        </div>

        <div className="editbar-field">
          <label htmlFor="block-extra">informacje dodatkowe</label>
          <InputTextarea
            id="block-extra"
            value={currentInfo}
            disabled
            rows={2}
            autoResize
          />
        </div>

        <div className="editbar-field">
          <label htmlFor="block-hours">dlugosc: {draft?.hourSpan ?? "-"}</label>
          <InputNumber
            id="block-hours"
            value={draft?.hourSpan ?? 1}
            disabled={disabled}
            onValueChange={(e) => handleFieldChange("hourSpan", Math.max(1, e.value ?? 1))}
            min={1}
            max={12}
          />
          <Slider
            value={draft?.hourSpan ?? 1}
            min={1}
            max={12}
            disabled={disabled}
            onChange={(e) => handleFieldChange("hourSpan", Math.max(1, Number(e.value) || 1))}
          />
        </div>

        <div className="editbar-field">
          <label>terminy</label>
          <div className="tt-term-grid">
            {Array.from({ length: 15 }, (_, index) => (
              <button key={index + 1} type="button" className="tt-term-cell">
                {index === 14 ? "x1" : index + 1}
              </button>
            ))}
            <button type="button" className="tt-term-cell">x2</button>
          </div>
        </div>

        <div className="editbar-field">
          <label htmlFor="block-note">notatka</label>
          <InputTextarea
            id="block-note"
            rows={2}
            value={draft?.note ?? ""}
            disabled={disabled}
            onChange={(e) => handleFieldChange("note", e.target.value)}
          />
        </div>

        <div className="editbar-field tt-color-row">
          <label htmlFor="block-color">kolor</label>
          <ColorPicker
              id="block-color"
              format="hex"
              value={(draft?.color ?? "#5f9fd1").replace("#", "")}
              disabled={disabled}
              onChange={(e) => handleFieldChange("color", `#${String(e.value)}`)}
            />
        </div>

        <div className="tt-edit-actions">
          <Button
            label={isEditing ? "zapisz" : "edytuj"}
            className="tt-edit-btn"
            disabled={!draft}
            onClick={handleEditOrSave}
          />
          <Button icon="pi pi-replay" rounded outlined onClick={onHide} />
        </div>

        <div className="tt-edit-bottom">
          <Button
            icon="pi pi-trash"
            severity="secondary"
            outlined
            disabled={!draft}
            onClick={() => draft && onDelete(draft.id)}
          />
          <Button label="NOWY BLOK" className="tt-new-block-btn" onClick={onHide} />
        </div>
      </div>
    </div>
  );
};

export default EditBar;