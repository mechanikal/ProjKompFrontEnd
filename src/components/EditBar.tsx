import React from "react";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { ColorPicker } from "primereact/colorpicker";
import { Button } from "primereact/button";
import { BlockData } from "../utils/ClassBlockUtils";

export type EditBarData = {
    blockData?: BlockData;
    onChange: (updated: BlockData) => void;
    onHide: () => void;
    onDelete: (blockId: number) => void;
};


const EditBar: React.FC<EditBarData> = ({ blockData, onChange, onHide, onDelete }) => {
  const visible = Boolean(blockData);
  const currentBlock = blockData;

  if (!currentBlock) {
    return (
      <Sidebar visible={visible} onHide={onHide} position="right" style={{ width: "22rem" }}>
        <p>Wybierz blok, aby edytowac szczegoly.</p>
      </Sidebar>
    );
  }

  const handleFieldChange = <K extends keyof BlockData>(key: K, value: BlockData[K]) => {
    onChange({
      ...currentBlock,
      [key]: value
    });
  };

  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      position="right"
      header={`Edycja bloku #${currentBlock.id}`}
      style={{ width: "22rem" }}
    >
      <div className="editbar-form">
        <div className="editbar-field">
          <label htmlFor="block-name">Nazwa</label>
          <InputText
            id="block-name"
            value={currentBlock.text}
            onChange={(e) => handleFieldChange("text", e.target.value)}
          />
        </div>

        <div className="editbar-field">
          <label htmlFor="block-hours">Dlugosc (h)</label>
          <InputNumber
            id="block-hours"
            value={currentBlock.hourSpan}
            onValueChange={(e) => handleFieldChange("hourSpan", Math.max(1, e.value ?? 1))}
            min={1}
            max={12}
            showButtons
          />
        </div>

        <div className="editbar-field-row">
          <div className="editbar-field">
            <label htmlFor="block-row">Dzien</label>
            <InputNumber
              id="block-row"
              value={currentBlock.row}
              onValueChange={(e) => handleFieldChange("row", Math.max(-1, e.value ?? currentBlock.row))}
              min={-1}
              max={6}
            />
          </div>

          <div className="editbar-field">
            <label htmlFor="block-col">Godzina Start</label>
            <InputNumber
              id="block-col"
              value={currentBlock.col}
              onValueChange={(e) => handleFieldChange("col", Math.max(-1, e.value ?? currentBlock.col))}
              min={-1}
              max={11}
            />
          </div>
        </div>

        <div className="editbar-field">
          <label htmlFor="block-color">Kolor</label>
          <ColorPicker
            id="block-color"
            format="hex"
            value={currentBlock.color.replace("#", "")}
            onChange={(e) => handleFieldChange("color", `#${String(e.value)}`)}
          />
        </div>

        <Button
          label="Usun Blok"
          icon="pi pi-trash"
          severity="danger"
          outlined
          onClick={() => onDelete(currentBlock.id)}
        />
      </div>
    </Sidebar>
  );
};

export default EditBar;