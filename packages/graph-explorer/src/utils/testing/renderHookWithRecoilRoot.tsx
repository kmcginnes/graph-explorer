import { renderHook } from "@testing-library/react";
import { type WritableAtom, Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { PropsWithChildren } from "react";

type AnyWritableAtom = WritableAtom<unknown, unknown[], unknown>;
export type MutableSnapshot = Map<AnyWritableAtom, unknown>;

// export class MutableSnapshot {
//   initialValues: Map<AnyWritableAtom, unknown> = new Map();

//   set<TAtom extends WritableAtom<TValue, unknown[], unknown>, TValue>(
//     atom: TAtom,
//     value: TValue
//   ) {
//     this.initialValues.set(atom, value);
//   }
// }

function HydrateAtoms({
  initialValues,
  children,
}: PropsWithChildren<{ initialValues: MutableSnapshot }>) {
  useHydrateAtoms(initialValues);
  return children;
}

function TestProvider({
  initialValues,
  children,
}: PropsWithChildren<{ initialValues: MutableSnapshot }>) {
  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  );
}

// export default function renderHookWithRecoilRoot<TResult>(
//   callback: (props: PropsWithChildren) => TResult,
//   initializeState?: (mutableSnapshot: MutableSnapshot) => void
// ) {
//   const mutableState = new MutableSnapshot();
//   initializeState ? initializeState(mutableState) : undefined;
//   return renderHook(callback, {
//     wrapper: ({ children }: PropsWithChildren) => (
//       <TestProvider initialValues={initialValues}>{children}</TestProvider>
//     ),
//   });
// }

export default function renderHookWithRecoilRoot<TResult>(
  callback: (props: PropsWithChildren) => TResult,
  initialValues?: Map<AnyWritableAtom, unknown>
) {
  return renderHook(callback, {
    wrapper: ({ children }: PropsWithChildren) => (
      <TestProvider initialValues={initialValues || new Map()}>
        {children}
      </TestProvider>
    ),
  });
}
