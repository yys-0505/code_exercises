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

function useEffect(callback, dependencies) {
  if (hookStates[hookIndex]) {
    const [lastDestroy, lastDependencies] = hookStates[hookIndex];

    let same = false;
    if (lastDependencies) {
      same = dependencies.every(
        (item, index) => item === lastDependencies[index]
      );
    }
    if (same) {
      hookIndex++;
    } else {
      lastDestroy && lastDestroy();
      const destroy = callback();
      hookStates[hookIndex++] = [destroy, dependencies];
    }
  } else {
    const destroy = callback();
    hookStates[hookIndex++] = [destroy, dependencies];
  }
}

function App() {
  const [name, setName] = useState("zhangsan");
  const [number, setNumber] = useState(19);

  useEffect(() => {
    const timer = setInterval(() => {
      setNumber(number + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [number]);
  return (
    <div>
      {name} <br />
      {number}
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setNumber(number + 1)}>Add</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<App />);
}
render();
