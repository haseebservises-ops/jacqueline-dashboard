import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ data, showAmount, columns }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Define Default Columns if no 'columns' prop is passed
    const defaultColumns = useMemo(() => [
        { header: 'Date', key: 'DateObj', label: 'Date', render: (row) => row.Date },
        { header: 'Name', key: 'Name', label: 'Name' },
        { header: 'Email', key: 'Email', label: 'Email' },
        {
            header: 'Offer', key: 'Offer', label: 'Offer', render: (row) => (
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
            )
        },
        ...(showAmount ? [{ header: 'Amount', key: 'Amount', label: 'Amount', align: 'right', render: (row) => row.Amount > 0 ? `$${row.Amount}` : '-' }] : [])
    ], [showAmount]);

    const activeColumns = columns || defaultColumns;

    // 1. Filter (Generic Search across all columns that are strings)
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const term = searchTerm.toLowerCase();
        return data.filter(item => {
            // Search all keys in the item that match active columns
            return activeColumns.some(col => {
                const value = item[col.key];
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    }, [data, searchTerm, activeColumns]);

    // 2. Sort (Generic Sort)
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle DateObj special case (if it exists in dataService)
                if (sortConfig.key === 'DateObj' && a.DateObj && b.DateObj) {
                    aValue = a.DateObj;
                    bValue = b.DateObj;
                }

                // Handle numbers
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    // keep as number
                } else {
                    // String fallback
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
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <div style={{ width: '16px' }}></div>;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    // Helper for table headers
    const Th = ({ col }) => (
        <th
            onClick={() => requestSort(col.key)}
            style={{
                textAlign: col.align || 'left',
                padding: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                userSelect: 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start', gap: '0.5rem' }}>
                {col.label || col.header}
                {getSortIcon(col.key)}
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
                        placeholder="Search..."
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

            {/* Table wrapper */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                            {activeColumns.map((col, idx) => (
                                <Th key={idx} col={col} />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                {activeColumns.map((col, cIdx) => (
                                    <td key={cIdx} style={{ padding: '1rem', fontSize: '0.9rem', textAlign: col.align || 'left' }}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {currentRows.length === 0 && (
                            <tr>
                                <td colSpan={activeColumns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
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
