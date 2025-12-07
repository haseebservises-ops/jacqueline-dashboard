import React from 'react';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-color)' }}>From:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontFamily: 'inherit' }}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-color)' }}>To:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontFamily: 'inherit' }}
                />
            </div>
        </div>
    );
};

export default DateFilter;
