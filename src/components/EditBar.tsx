import React from "react";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ColorPicker } from "primereact/colorpicker";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { BlockData } from "../utils/ClassBlockUtils";

export type EditBarData = {
    blockData?: BlockData;
    onChange: (updated: BlockData) => void;
    onHide: () => void;
    onDelete: (blockId: number) => void;
};


const EditBar: React.FC<EditBarData> = ({ blockData, onChange, onHide, onDelete }) => {
  const currentBlock = blockData;
  const disabled = !currentBlock;

  const handleFieldChange = <K extends keyof BlockData>(key: K, value: BlockData[K]) => {
    if (!currentBlock) {
      return;
    }

    onChange({
      ...currentBlock,
      [key]: value
    });
  };

  return (
    <div className="tt-edit-panel">
      <div className="tt-edit-header">Panel Edycji</div>
      <div className="editbar-form">
        <div className="editbar-field">
          <label htmlFor="block-name">Nazwa przedmiotu</label>
          <InputText
            id="block-name"
            value={currentBlock?.text ?? ""}
            disabled={disabled}
            onChange={(e) => handleFieldChange("text", e.target.value)}
          />
        </div>

        <div className="editbar-field">
          <label htmlFor="block-extra">informacje dodatkowe</label>
          <InputText
            id="block-extra"
            value={currentBlock ? `blok #${currentBlock.id}` : ""}
            disabled
          />
        </div>

        <div className="editbar-field">
          <label htmlFor="block-hours">dlugosc: {currentBlock?.hourSpan ?? "-"}</label>
          <InputNumber
            id="block-hours"
            value={currentBlock?.hourSpan ?? 1}
            disabled={disabled}
            onValueChange={(e) => handleFieldChange("hourSpan", Math.max(1, e.value ?? 1))}
            min={1}
            max={12}
          />
          <Slider value={currentBlock?.hourSpan ?? 1} min={1} max={12} disabled={disabled} />
        </div>

        <div className="editbar-field">
          <label>terminy</label>
          <div className="tt-term-grid">
            {Array.from({ length: 14 }, (_, index) => (
              <button key={index + 1} type="button" className="tt-term-cell">
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="editbar-field">
          <label htmlFor="block-color">notatka / kolor</label>
          <ColorPicker
            id="block-color"
            format="hex"
            value={(currentBlock?.color ?? "#5f9fd1").replace("#", "")}
            disabled={disabled}
            onChange={(e) => handleFieldChange("color", `#${String(e.value)}`)}
          />
        </div>

        <div className="tt-edit-actions">
          <Button label="edytuj" className="tt-edit-btn" disabled={disabled} />
          <Button icon="pi pi-replay" rounded outlined onClick={onHide} />
        </div>

        <div className="tt-edit-bottom">
          <Button
            icon="pi pi-trash"
            severity="secondary"
            outlined
            disabled={disabled}
            onClick={() => currentBlock && onDelete(currentBlock.id)}
          />
          <Button label="NOWY BLOK" className="tt-new-block-btn" onClick={onHide} />
        </div>
      </div>
    </div>
  );
};

export default EditBar;