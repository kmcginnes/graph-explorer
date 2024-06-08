import { PropsWithChildren } from "react";
import { RecoilRoot } from "recoil";
import StateDebug from "./StateDebug";
import { env } from "../../utils";
import { Provider } from "jotai";

const StateProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  return (
    <Provider>
      <RecoilRoot>
        {children}
        {env.DEV && <StateDebug />}
      </RecoilRoot>
    </Provider>
  );
};

export default StateProvider;
