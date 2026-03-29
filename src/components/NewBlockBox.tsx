import React, { useRef, useState } from "react";
import { GridProps } from "../utils/TimeGridUtils";

export type BlockBoxData = {


}


const NewBlockBox: React.FC<BlockBoxData> = () => {
  return (
    <div>
    <div
      style={{
        position: "absolute",
        width: window.innerWidth * 0.25,
        height: window.innerWidth * 0.75/2,
        backgroundColor: "green",
        left: window.innerWidth * 0.75,
        top: 0,
      }}
      >
      {"edit bar"}
    </div>
    </div>
  );
};


export default NewBlockBox;