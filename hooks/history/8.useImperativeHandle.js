import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const hookStates = [];
let hookIndex = 0;

function useImperativeHandle(ref, handle) {
  ref.current = handle();
}

function Child(props, inputRef) {
  useImperativeHandle(inputRef, () => ({
    focus() {
      console.log("focus");
    },
  }));
  return <input type="text" />;
}

const ForwardChild = React.forwardRef(Child);

function App() {
  const inputRef = React.useRef();
  function getFocus() {
    console.log(inputRef.current);
  }

  return (
    <div>
      <ForwardChild ref={inputRef} />
      <button onClick={getFocus}>get focus</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<App />);
}
render();
