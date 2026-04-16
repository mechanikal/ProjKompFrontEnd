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
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
  },
  animate: {
    opacity: 1,
    height: "auto",
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
    transition: springTransition,
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
};
