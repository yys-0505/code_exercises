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

// useEffect宏任务执行 useLayoutEffect微任务执行
// 页面执行顺序： script -> 微任务 -> 渲染页面 -> 宏任务
// 所以useLayoutEffect里面的动画不会生效, 因为是微任务, 执行之后才渲染页面
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
      const arr = [, dependencies];
      setTimeout(() => {
        arr[0] = callback();
      });
      hookStates[hookIndex++] = arr;
    }
  } else {
    const arr = [, dependencies];
    setTimeout(() => {
      arr[0] = callback();
    });
    hookStates[hookIndex++] = arr;
  }
}

function useLayoutEffect(callback, dependencies) {
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
      const arr = [, dependencies];
      queueMicrotask(() => {
        arr[0] = callback();
      });
      hookStates[hookIndex++] = arr;
    }
  } else {
    const arr = [, dependencies];
    queueMicrotask(() => {
      arr[0] = callback();
    });
    hookStates[hookIndex++] = arr;
  }
}

function useRef(initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || { current: initialState };
  return hookStates[hookIndex++];
}

function App() {
  const box1 = useRef();
  const box2 = useRef();

  useEffect(() => {
    // 宏任务
    box1.current.style.transform = "translate(200px)";
    box1.current.style.transition = "all .5s";
  }, []);

  useLayoutEffect(() => {
    // 微任务
    box2.current.style.transform = "translate(200px)";
    box2.current.style.transition = "all .5s";
  }, []);

  const style = { width: "100px", height: "100px" };
  return (
    <div>
      <div ref={box1} style={{ ...style, background: "yellow" }}></div>
      <div ref={box2} style={{ ...style, background: "green" }}></div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
function render() {
  hookIndex = 0;
  root.render(<App />);
}
render();
