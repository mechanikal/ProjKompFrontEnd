import { useMemo, useState, useEffect } from "react";
import Timetable from "./components/Timetable";
import "./App.css";

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}


function App() {
  const { width, height } = useWindowSize();
  const contentWidth = Math.min(980, Math.max(760, width * 0.72));
  const CELL_WIDTH_BONUS = 2;
  const CELL_HEIGHT_BONUS = 2;

  // Keep grid math on integer pixels to avoid subpixel drift between cells and blocks.
  const rawGridWidth = contentWidth - 74;
  const colWidth = Math.max(52, Math.floor(rawGridWidth / 12) + CELL_WIDTH_BONUS);
  const gridWidth = colWidth * 12;

  const rawGridHeight = Math.min(420, Math.max(280, height * 0.42));
  const rowHeight = Math.max(36, Math.floor(rawGridHeight / 7) + CELL_HEIGHT_BONUS);
  const gridHeight = rowHeight * 7;

  const gridProps = useMemo(() => ({
    rows: 7,
    cols: 12,
    gridWidth,
    gridHeight,
    rowHeights: [1, 1, 1, 1, 1, 1, 1],
    StartPoint: { x: 54, y: 0 },
    Bin: {
      StartPoint: { x: 54 + gridWidth - 230, y: gridHeight + 18 },
      height: 62,
      width: 230,
    } 
  }), [gridHeight, gridWidth]);

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-title">WIRTUALNY PLAN ZAJEC POLITECHNIKI LODZKIEJ</div>
        <div className="app-user">
          <span>Logowanie</span>
          <span className="app-avatar" aria-hidden="true" />
        </div>
      </header>

      <main className="app-main">
        <Timetable gridProps={gridProps} />
      </main>

      <footer className="app-footer">
        <div className="app-footer-logo">P L</div>
        <div className="app-footer-content">
          <p>Projekt kompetencyjny</p>
          <p>AI powered Class Plan for Lodz University of Technology</p>
          <p>Wykonawcy: Kacper Orliwoszewski, Krzysztof Wojtal, Stanislaw Jaworski, Witold Struminski</p>
        </div>
      </footer>
    </div>
  );
}

export default App;