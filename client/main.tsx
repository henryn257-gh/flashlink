import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import "./utils/compression/setup";

import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("FlashLink root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
