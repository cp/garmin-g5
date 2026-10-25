import { useEffect, useRef } from "react";

// These hooks are how the instrument moves without React re-rendering. A
// motion value drives an attribute or a text node directly; the component
// renders once and then stays out of the way.

const useBinding = (value, apply) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !value) {
      return undefined;
    }

    apply(node, value.get());

    return value.on("change", (next) => apply(node, next));
  });

  return ref;
};

export const useMotionText = (value, format = (v) => String(Math.round(v))) =>
  useBinding(value, (node, next) => {
    const text = format(next);
    if (node.textContent !== text) {
      node.textContent = text;
    }
  });

export const useMotionAttr = (value, attribute, format = (v) => v) =>
  useBinding(value, (node, next) => node.setAttribute(attribute, format(next)));

export const useMotionTransform = (value, format) =>
  useBinding(value, (node, next) =>
    node.setAttribute("transform", format(next)),
  );

// For the handful of places that need several values at once, such as the
// pitch ladder, which translates and rotates together.
export const useMotionValues = (values, apply) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    const read = () => values.map((value) => value.get());
    const run = () => apply(node, ...read());

    run();
    const unsubscribes = values.map((value) => value.on("change", run));

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  });

  return ref;
};
