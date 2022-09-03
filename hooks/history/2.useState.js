import React from "react";
import ReactDOM from "react-dom/client";

const hookStates = [];
let hookIndex = 0;

function useState(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;

  const currentIndex = hookIndex;
  function setState(newState) {
    hookStates[currentIndex] = newState;
    render();
  }
  return [hookStates[hookIndex++], setState];
}

function Counter() {
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(1);
  return (
    <div>
      {number1}
      <button onClick={() => setNumber1(number1 + 1)}>Add1</button>
      <br />
      {number2}
      <button onClick={() => setNumber2(number2 + 1)}>Add2</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<Counter />);
}
render();
