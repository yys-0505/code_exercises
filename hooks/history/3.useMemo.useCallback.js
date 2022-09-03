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

function useMemo(factory, dependencies) {
  if (hookStates[hookIndex]) {
    const [lastMemo, lastDependencies] = hookStates[hookIndex];
    const same = dependencies.every(
      (item, index) => item === lastDependencies[index]
    );
    if (same) {
      hookIndex++;
      return lastMemo;
    } else {
      const newMemo = factory();
      hookStates[hookIndex++] = [newMemo, dependencies];
      return newMemo;
    }
  } else {
    const newMemo = factory();
    hookStates[hookIndex++] = [newMemo, dependencies]; // hookStates[2] =[{ age }, [age]]
    return newMemo;
  }
}

function useCallback(callback, dependencies) {
  if (hookStates[hookIndex]) {
    const [lastCallback, lastDependencies] = hookStates[hookIndex];
    const same = dependencies.every(
      (item, index) => item === lastDependencies[index]
    );
    if (same) {
      hookIndex++;
      return lastCallback;
    } else {
      hookStates[hookIndex++] = [callback, dependencies];
      return callback;
    }
  } else {
    hookStates[hookIndex++] = [callback, dependencies];
    return callback;
  }
}

function Child({ data, onButtonClick }) {
  console.log("child render");
  return (
    <div>
      {data.age}
      <button onClick={onButtonClick}>change age</button>
    </div>
  );
}

Child = React.memo(Child);

function App() {
  const [name, setName] = useState("zhangsan");
  const [age, setAge] = useState(19);
  const data = useMemo(() => ({ age }), [age]);
  const addClick = useCallback(() => setAge(age + 1), [age]);
  return (
    <div>
      {name}
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <Child data={data} onButtonClick={addClick} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<App />);
}
render();
