import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { routes } from "./App";
import "core-js/full/iterator";

import "./index.css";
import "@mantine/core/styles.css";

const BootstrapApp = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={routes} />
    </React.StrictMode>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<BootstrapApp />);
