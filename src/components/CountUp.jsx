import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const CountUp = ({ value, duration = 1.5, prefix = "", suffix = "" }) => {
    // Determine target based on value type
    const target = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));

    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
    const displayValue = useTransform(spring, (current) => {
        // Format logic: check if integer or float
        if (target % 1 !== 0) {
            return current.toFixed(2); // 2 decimals for currency usually
        }
        return Math.round(current).toString();
    });

    useEffect(() => {
        spring.set(target);
    }, [target, spring]);

    return (
        <motion.span>
            {prefix}
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </motion.span>
    );
};

export default CountUp;
