import { Variants } from "framer-motion";

export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

export const quickSpringTransition = {
  type: "spring",
  stiffness: 360,
  damping: 26,
} as const;

export const hoverTapScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.95 },
} as const;

export const weekendRowVariants: Variants = {
  initial: {
    scaleY: 0,
    opacity: 0,
  },
  animate: (targetHeight: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: { ...springTransition, duration: 0.35 },
  }),
  exit: {
    scaleY: 0,
    opacity: 0,
    transition: { ...springTransition, duration: 0.35 },
  },
};

export const blockListVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

export const blockItemVariants: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: -12,
    transition: { ...springTransition, duration: 0.15 },
  },
};
