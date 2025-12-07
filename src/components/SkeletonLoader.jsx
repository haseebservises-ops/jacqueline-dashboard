import React from 'react';

const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => {
    return (
        <div
            className="skeleton-shine"
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: '#e0e0e0', // Base grey
                ...style
            }}
        />
    );
};

export default SkeletonLoader;
