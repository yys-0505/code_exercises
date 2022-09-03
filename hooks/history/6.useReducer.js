import React from "react";
import ReactDOM from "react-dom/client";

const hookStates = [];
let hookIndex = 0;

function useReducer(reducer, initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;
  const currentIndex = hookIndex;
  function dispatch(action) {
    hookStates[currentIndex] = reducer(hookStates[currentIndex], action);
    render();
  }
  return [hookStates[hookIndex++], dispatch];
}

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, 0);
  console.log(state);
  return (
    <div>
      <span>{state}</span>
      <button onClick={() => dispatch({ type: "add" })}>Add</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<Counter />);
}
render();
