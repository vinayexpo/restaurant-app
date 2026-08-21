export const easing = {
  smooth: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  bounce: { type: 'spring', stiffness: 500, damping: 20 },
  snappy: [0.2, 0, 0, 1],
}

export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
}

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: duration.normal, ease: easing.smooth },
}

export const cardHoverVariants = {
  whileHover: { y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
  transition: { duration: duration.fast },
}

export const cartItemVariants = {
  layout: true,
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9, height: 0 },
}

export const drawerVariants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { ease: easing.smooth, duration: duration.slow },
}

export const bottomSheetVariants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { ease: easing.smooth, duration: duration.slow },
}

export const badgePulseVariants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: easing.bounce,
}

export const skeletonShimmer = {
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
}
