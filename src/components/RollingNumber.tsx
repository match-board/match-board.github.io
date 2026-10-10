import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  className?: string;
  glowColor?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  className = '',
  glowColor,
}) => {
  const prevValueRef = useRef(value);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    if (value > prevValueRef.current) {
      setDirection('up');
    } else if (value < prevValueRef.current) {
      setDirection('down');
    }
    prevValueRef.current = value;
  }, [value]);

  const variants = {
    initial: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '45%' : '-45%',
      opacity: 0,
      scale: 0.85,
    }),
    animate: {
      y: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 380,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '-45%' : '45%',
      opacity: 0,
      scale: 0.85,
      transition: {
        duration: 0.16,
        ease: 'easeIn',
      },
    }),
  };

  const style = glowColor
    ? {
        textShadow: `0 0 40px ${glowColor}50, 0 0 80px ${glowColor}25`,
      }
    : undefined;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`relative overflow-hidden inline-flex items-center justify-center select-none ${className}`}
    >
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.span
          key={value}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={style}
          className="font-stadium inline-block tabular-nums leading-none tracking-tight"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default RollingNumber;
