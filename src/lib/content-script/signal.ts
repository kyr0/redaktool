import { atom, type ReadableAtom } from "nanostores";

export type SignalState<T> = {
  _?: number;
  value: T;
};

export interface SignalAtom<Value = any, RawValue = any>
  extends ReadableAtom<Value> {
  /**
   * Change store value.
   *
   * ```js
   * $router.set({ path: location.pathname, page: parse(location.pathname) })
   * ```
   *
   * @param newValue New store value.
   */
  set(newValue: Value | RawValue): void;
}

// loading atom that always flips the value, even if the same value is set multiple times
export const atomicSignal = <T>() => {
  const a = atom({
    _: 0,
    value: false,
  });

  // makes sure the value flips, even though two of the same values follow each other
  const set = a.set;
  a.set = (newValue) => {
    // value passed is scalar
    if (typeof newValue !== "object") {
      newValue = {
        _: Math.random(),
        value: newValue,
      };
    }

    set({
      _: newValue._ + 1,
      value: newValue.value,
    });
  };
  return a as SignalAtom<SignalState<T>, T>;
};
