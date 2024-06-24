import { PropsWithChildren, Suspense } from "react";
import { Provider } from "jotai";

const StateProvider = ({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  return (
    <Provider>
      <Suspense fallback="Loading...">{children}</Suspense>
    </Provider>
  );
};

export default StateProvider;
