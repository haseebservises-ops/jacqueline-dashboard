import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#ffffff',
            color: '#333'
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#ff4500',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255, 69, 0, 0.4)'
                }}
            >
                {/* Optional Icon inside */}
                <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%' }} />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    letterSpacing: '1px'
                }}
            >
                {message}
            </motion.h2>
        </div>
    );
};

export default LoadingScreen;
