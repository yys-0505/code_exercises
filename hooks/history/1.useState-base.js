import React from "react";
import ReactDOM from "react-dom/client";

let lastState;
function useState(initialState) {
  lastState = lastState || initialState;
  function setState(newState) {
    lastState = newState;
    render();
  }
  return [lastState, setState];
}

function Counter() {
  const [number, setNumber] = useState(0);
  return (
    <div>
      {number}
      <button onClick={() => setNumber(number + 1)}>Add</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  root.render(<Counter />);
}
render();
