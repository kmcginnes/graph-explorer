import { Route, Routes } from "react-router";
import Redirect from "./components/Redirect";
import Connections from "./workspaces/Connections";
import DataExplorer from "./workspaces/DataExplorer";
import GraphExplorer from "./workspaces/GraphExplorer";
import {
  SettingsAbout,
  SettingsGeneral,
  SettingsRoot,
} from "./workspaces/Settings";
import AppLayout from "./AppLayout";

export function App() {
  return (
    <Routes>
      <Route Component={AppLayout}>
        <Route path="/connections" Component={Connections} />
        <Route path="/data-explorer/:vertexType" Component={DataExplorer} />
        <Route path="/graph-explorer" Component={GraphExplorer} />
        <Route path="/settings" Component={SettingsRoot}>
          <Route path="general" Component={SettingsGeneral} />
          <Route path="about" Component={SettingsAbout} />
        </Route>
        <Route path="*" element={<Redirect to="/graph-explorer" />} />
      </Route>
    </Routes>
  );
}
