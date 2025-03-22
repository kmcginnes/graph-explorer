import { Outlet } from "react-router";
import ConnectedProvider from "./core/ConnectedProvider";

export default function AppLayout() {
  return (
    <ConnectedProvider>
      <Outlet />
    </ConnectedProvider>
  );
}
