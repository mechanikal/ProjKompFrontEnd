import React from "react";
import { BlockData } from "../utils/ClassBlockUtils";

export type EditBarData = {
    blockData?: BlockData
    onChange: (updated: BlockData) => void;
}


const EditBar: React.FC<EditBarData> = ({blockData, onChange}) => {
  if (!blockData) return null
  const ignoredKeys: (keyof BlockData)[] = ["id", "x", "y", "subrow"];

  const handleFieldChange = <K extends keyof BlockData>(key: K, value: BlockData[K]) => {
    onChange({
      ...blockData,
      [key]: value
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        width: "20vw",
        height: "100vh",
        backgroundColor: "green",
        right: 0,
        top: 0,
        padding: "10px"
      }}
    >
      <p>edit bar</p>

      {Object.entries(blockData)
      .filter(([key]) => !ignoredKeys.includes(key as keyof BlockData))
      .map(([key, value]) => (
        <div key={key}>
            {key}
            <input
            type={typeof value === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => {
              const typedKey = key as keyof BlockData;
              const nextValue = typeof value === "number"
                ? Number(e.target.value)
                : e.target.value;

              handleFieldChange(typedKey, nextValue as BlockData[typeof typedKey]);
            }}
            style={{ width: "100%" }}
            />
        </div>
        ))}
    </div>
  );
};

export default EditBar;