import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import "core-js/full/iterator";
import "./index.css";
import "@mantine/core/styles.css";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
