import React, { useRef, useState } from "react";
import { GridProps } from "../utils/TimeGridUtils";
import { BlockData } from "../utils/ClassBlockUtils";

export type EditBarData = {
    blockData?: BlockData
    onChange: (updated: BlockData) => void;
}


const EditBar: React.FC<EditBarData> = ({blockData, onChange}) => {
    
  if (!blockData) return null
  const [text, setText] = useState("");
    const ignoredKeys: (keyof BlockData)[] = ["id", "x", "y","subrow"];


  const handleFieldChange = (key: keyof BlockData, value: any) => {
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
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(key as keyof BlockData, e.target.value)}
            style={{ width: "100%" }}
            />
        </div>
        ))}
    </div>
  );
};

export default EditBar;