import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ data, showAmount }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // 1. Filter
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const term = searchTerm.toLowerCase();
            const nameMatch = item.Name?.toLowerCase().includes(term);
            const emailMatch = item.Email?.toLowerCase().includes(term);
            return nameMatch || emailMatch;
        });
    }, [data, searchTerm]);

    // 2. Sort
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle Amount specifically as it's a number
                if (sortConfig.key === 'Amount') {
                    // aValue and bValue are already numbers based on dataService, but safer to check
                } else if (sortConfig.key === 'DateObj') {
                    // Use the Date object for sorting if available
                    aValue = a.DateObj;
                    bValue = b.DateObj;
                } else {
                    // String comparison for others
                    aValue = aValue ? aValue.toString().toLowerCase() : '';
                    bValue = bValue ? bValue.toString().toLowerCase() : '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        } else {
            // Default sort by Date descending (newest first) if no sort selected
            // Assuming data comes in some order, but let's enforce date desc by default if needed.
            // For now, let's keep array order if no sort.
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // 3. Paginate
    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const currentRows = useMemo(() => {
        const indexOfLastRow = currentPage * rowsPerPage;
        const indexOfFirstRow = indexOfLastRow - rowsPerPage;
        return sortedData.slice(indexOfFirstRow, indexOfLastRow);
    }, [sortedData, currentPage, rowsPerPage]);

    // Handlers
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 on search
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return <div style={{ width: '16px' }}></div>; // Placeholder for alignment
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    // Helper for table headers to make them clickable
    const Th = ({ label, sortKey, align = 'left' }) => (
        <th
            onClick={() => requestSort(sortKey)}
            style={{
                textAlign: align,
                padding: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                userSelect: 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', gap: '0.5rem' }}>
                {label}
                {getSortIcon(sortKey)}
            </div>
        </th>
    );

    return (
        <div className="card">
            {/* Header: Title + Search */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            fontSize: '0.9rem',
                            outline: 'none',
                            width: '250px'
                        }}
                    />
                </div>
            </div>

            {/* Table wrapper for horizontal scroll */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                            {/* Using DateObj for sorting but displaying string Date */}
                            <Th label="Date" sortKey="DateObj" />
                            <Th label="Name" sortKey="Name" />
                            <Th label="Email" sortKey="Email" />
                            <Th label="Offer" sortKey="Offer" />
                            {showAmount && <Th label="Amount" sortKey="Amount" align="right" />}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, index) => (
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
                        {currentRows.length === 0 && (
                            <tr>
                                <td colSpan={showAmount ? 5 : 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    {searchTerm ? 'No results match your search.' : 'No data available.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '2rem',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                            background: 'none',
                            border: '1px solid #eee',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            color: currentPage === 1 ? '#ccc' : 'var(--text-color)'
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Page <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{currentPage}</span> of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                            background: 'none',
                            border: '1px solid #eee',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            color: currentPage === totalPages ? '#ccc' : 'var(--text-color)'
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
