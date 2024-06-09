import { PropsWithChildren } from "react";
import { Provider } from "jotai";

const StateProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  return <Provider>{children}</Provider>;
};

export default StateProvider;
