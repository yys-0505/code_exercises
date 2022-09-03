import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const hookStates = [];
let hookIndex = 0;

function useContext(context) {
  return context._currentValue;
}

const CounterContext = React.createContext();

function ChildCounter() {
  const { number, setNumber } = useContext(CounterContext);
  return (
    <div>
      {number}
      <button onClick={() => setNumber(number + 1)}>Add</button>
    </div>
  );
}

function Counter() {
  const [number, setNumber] = useState(0);
  return (
    // context._currentValue = { number, setNumber }
    <CounterContext.Provider value={{ number, setNumber }}>
      <ChildCounter />
    </CounterContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<Counter />);
}
render();
