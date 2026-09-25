import { useEffect, useRef } from "react";

/**
 * يغلق الـ dropdown عند الضغط خارجه أو الضغط على Escape.
 * نخزّن الـ callback في ref حتى لا نعيد ربط الـ listeners كل render.
 */
export function useClickOutside<T extends HTMLElement>(
  onOutside: () => void,
  active = true,
) {
  const ref = useRef<T | null>(null);
  const saved = useRef(onOutside);

  useEffect(() => {
    saved.current = onOutside;
  });

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = ref.current;
      if (node && event.target instanceof Node && !node.contains(event.target)) {
        saved.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") saved.current();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  return ref;
}
