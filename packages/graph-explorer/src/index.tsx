import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router";
import App from "./App";
import "core-js/full/iterator";

import "./index.css";
import "@mantine/core/styles.css";

const BootstrapApp = () => {
  return (
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<BootstrapApp />);
