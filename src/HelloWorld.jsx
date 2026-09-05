import { useState } from "react";

export default function HelloWorld() {
  const [text, setText] = useState("Hello");

  return (
    <div>
      <h1>{text}</h1>
      <button onClick={() => setText("World")}>Click Me</button>
    </div>
  );
}
