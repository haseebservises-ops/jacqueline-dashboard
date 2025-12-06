import React from 'react';

const DataTable = ({ data, showAmount }) => {
    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Offer</th>
                        {showAmount && <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Amount</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{row.Date}</td>
                            <td style={{ padding: '1rem', fontWeight: 500 }}>{row.Name}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.Email}</td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                <span style={{
                                    background: '#FFF0E6',
                                    color: 'var(--primary-color)',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {row.Offer}
                                </span>
                            </td>
                            {showAmount && (
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                                    {row.Amount > 0 ? `$${row.Amount}` : '-'}
                                </td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={showAmount ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No data available for the selected period.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
