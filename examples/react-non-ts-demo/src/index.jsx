import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import Highlight, { HighlightWrapper, useHighlight } from "react-css-highlight";
import "react-css-highlight/styles";
import "./styles.css";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

const content = (
  <div>
    <p>React is a JavaScript library for building user interfaces.</p>
    <p>React makes it painless to create interactive UIs.</p>
  </div>
);

// "Highlight" component demo
function BasicDemo() {
  const contentRef = useRef(null);

  return (
    <>
      <Highlight search="React" targetRef={contentRef} />
      <div ref={contentRef}>{content}</div>
    </>
  );
}

// "HighlightWrapper" component demo
function WrapperDemo() {
  return <HighlightWrapper search="React">{content}</HighlightWrapper>;
}

// "useHighlight" hook demo
function UseHighlightDemo() {
  const contentRef = useRef(null);
  const { matchCount, isSupported, error } = useHighlight({
    search: "react",
    targetRef: contentRef,
  });

  return (
    <>
      <div ref={contentRef}>{content}</div>
      <footer
        style={{
          border: "1px solid silver",
          padding: "3px 6px",
          display: "inline-block",
        }}
      >
        Match count: {matchCount}
      </footer>
    </>
  );
}

root.render(
  <React.StrictMode>
    <h2>
      <code>Highlight</code>
    </h2>
    <BasicDemo />

    <h2>
      <code>HighlightWrapper</code>
    </h2>
    <WrapperDemo />

    <h2>
      <code>useHighlight</code>
    </h2>
    <UseHighlightDemo />
  </React.StrictMode>
);
