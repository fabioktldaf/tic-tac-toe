import React from "react";

export default ({ squares, handleClick }) => (
  <div className="board">
    {squares.map((val, i) => (
      <button className="square" onClick={() => handleClick(i)} key={i}>
        {val === "1" ? "X" : val === "2" ? "O" : ""}
      </button>
    ))}
  </div>
);
