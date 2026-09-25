import { useEffect, useMemo, useRef } from "react";

type Debounced<A extends unknown[]> = ((...args: A) => void) & {
  /** إلغاء النداء المؤجّل، مفيد عند تنفيذ إجراء فوري مثل المسح */
  cancel: () => void;
};

/**
 * يؤخّر تنفيذ الـ callback حتى تتوقف النداءات لمدة delay.
 * نحفظ الـ callback داخل ref حتى لا نُعيد إنشاء الدالة المؤجّلة مع كل render.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300,
): Debounced<A> {
  const savedCallback = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  });

  // إلغاء المؤقت عند إزالة المكوّن حتى لا نُحدّث الحالة بعد اختفائه
  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  return useMemo(() => {
    const run = (...args: A) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => savedCallback.current(...args), delay);
    };
    run.cancel = () => clearTimeout(timer.current);
    return run as Debounced<A>;
  }, [delay]);
}
