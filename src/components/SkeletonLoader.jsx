import React from 'react';

const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => {
    return (
        <div
            className="skeleton-loader"
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
        />
    );
};

export default SkeletonLoader;
