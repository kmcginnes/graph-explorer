import { PropsWithChildren } from "react";
import { Provider } from "jotai";

const StateDebug = () => {
  // TODO: Figure out debugging tools
  // useAtomsDebugValue();
  return null;
};

const StateProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  return (
    <Provider>
      {children}
      {import.meta.env.DEV && <StateDebug />}
    </Provider>
  );
};

export default StateProvider;
