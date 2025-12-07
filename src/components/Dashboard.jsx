import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchDashboardData } from '../services/dataService';
import DateFilter from './DateFilter';
import Sidebar from './Sidebar';
import Overview from './Overview';
import SkeletonLoader from './SkeletonLoader';
import Transactions from './Transactions';
import DataTable from './DataTable';
import { RefreshCw, Menu, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ framework: [], checkout: [], openLeads: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // UI State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [clientConfig, setClientConfig] = useState(null);

    const loadData = useCallback(async () => {
        if (!user) return;
        setIsRefreshing(true);
        setError(null);
        try {
            // 1. Get Client Config from Supabase
            // CHANGED: We now lookup by Email so we can pre-provision clients
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('spreadsheet_id, config')
                .eq('email', user.email)
                .single();


            if (clientError || !clientData) {
                if (user?.email === 'haseebservises@gmail.com') {
                    // Fallback for Admin So they don't get locked out
                    console.log("Admin fallback: No config found, using default.");
                    setClientConfig({
                        branding: { primaryColor: '#ff4500', logoUrl: '/src/assets/logo.png' },
                        features: { showOverview: true, showFramework: true, showCheckout: true, showOpenLeads: true, allowExport: true }
                    });
                    // Set empty data or default data
                    setData({ framework: [], checkout: [], openLeads: [] });
                    setLastUpdated(new Date());
                    setLoading(false);
                    setIsRefreshing(false);
                    return;
                }
                throw new Error('No configuration found for this user.');
            }

            if (!clientData?.spreadsheet_id) throw new Error('No Spreadsheet ID linked to this account.');

            // Force Admin Branding Override if it IS the admin, even if data exists
            if (user?.email === 'haseebservises@gmail.com') {
                clientData.config.branding = {
                    primaryColor: '#ff4500',
                    logoUrl: '/src/assets/logo.png'
                };
            }

            // Store config for dynamic rendering
            setClientConfig(clientData.config);

            // 2. Fetch Data from that Sheet
            const result = await fetchDashboardData(clientData.spreadsheet_id);
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to load data", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, loadData]);

    // Apply Custom Branding (Primary Color)
    useEffect(() => {
        if (clientConfig?.branding?.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', clientConfig.branding.primaryColor);
        } else {
            // Revert to default if no config (optional, or keeping previous value)
            document.documentElement.style.removeProperty('--primary-color');
        }
    }, [clientConfig]);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarCollapsed(true); // Auto-collapse on mobile
            } else {
                setIsSidebarCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getActiveData = useCallback(() => {
        switch (activeTab) {
            case 'framework': return data.framework;
            case 'checkout': return data.checkout;
            case 'openLeads': return data.openLeads;
            default: return [];
        }
    }, [activeTab, data]);

    const handleExport = () => {
        const dataToExport = getActiveData();
        if (!dataToExport || dataToExport.length === 0) {
            alert('No data to export!');
            return;
        }

        // Convert to CSV
        // Take headers from first row keys
        const headers = Object.keys(dataToExport[0]);

        const csvRows = [headers.join(',')];

        for (const row of dataToExport) {
            const values = headers.map(header => {
                const val = row[header] || '';
                // Escape quotes
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const filterData = (dataset) => {
        return dataset.filter(item => {
            if (startDate || endDate) {
                if (!item.DateObj) return false;
                const itemDate = item.DateObj;
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            }
            return true;
        });
    };

    const filteredFramework = useMemo(() => filterData(data.framework), [data.framework, startDate, endDate]);
    const filteredCheckout = useMemo(() => filterData(data.checkout), [data.checkout, startDate, endDate]);
    const filteredOpenLeads = useMemo(() => filterData(data.openLeads), [data.openLeads, startDate, endDate]);

    const stats = useMemo(() => {
        const totalFillups = filteredFramework.length;
        const totalPurchases = filteredCheckout.length;
        const totalRevenue = filteredCheckout.reduce((sum, item) => sum + item.Amount, 0);

        const conversionRate = totalFillups > 0 ? ((totalPurchases / totalFillups) * 100).toFixed(1) : 0;

        return {
            totalFillups,
            totalPurchases,
            totalRevenue,
            conversionRate
        };
    }, [filteredFramework, filteredCheckout]);

    const chartData = useMemo(() => {
        const grouped = filteredCheckout.reduce((acc, item) => {
            const dateStr = item.Date;
            if (!acc[dateStr]) {
                acc[dateStr] = { date: dateStr, amount: 0, count: 0 };
            }
            acc[dateStr].amount += item.Amount;
            acc[dateStr].count += 1;
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredCheckout]);


    const getTabTitle = () => {
        switch (activeTab) {
            case 'overview': return 'Dashboard Overview';
            case 'framework': return 'Framework Leads';
            case 'checkout': return 'Framework Checkout';
            case 'openLeads': return 'Framework Open Leads';
            default: return 'Dashboard';
        }
    };

    const getTabDescription = () => {
        switch (activeTab) {
            case 'overview': return 'Performance metrics and trends';
            case 'framework': return 'People who filled up the initial form';
            case 'checkout': return 'Completed purchases';
            case 'openLeads': return 'People who filled form but did not purchase';
            default: return '';
        }
    };

    if (loading && data.framework.length === 0) {
        return (
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <SkeletonLoader width="240px" height="120px" borderRadius="12px" />
                    <SkeletonLoader width="240px" height="120px" borderRadius="12px" />
                    <SkeletonLoader width="240px" height="120px" borderRadius="12px" />
                    <SkeletonLoader width="240px" height="120px" borderRadius="12px" />
                </div>
                <SkeletonLoader width="100%" height="400px" borderRadius="12px" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem', background: 'var(--background-color)', color: 'var(--text-color)' }}>
                <h3>Configuration Error</h3>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const mainContentMargin = isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 101,
                        background: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        boxShadow: 'var(--shadow)',
                        display: isSidebarCollapsed ? 'block' : 'none' // Show only when sidebar is hidden
                    }}
                >
                    <Menu size={24} />
                </button>
            )}

            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (isMobile) setIsSidebarCollapsed(true); // Close sidebar on mobile after selection
                }}
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
                branding={clientConfig?.branding}
                features={clientConfig?.features}
            />

            <div style={{
                flex: 1,
                marginLeft: mainContentMargin,
                padding: isMobile ? '4rem 1rem 1rem 1rem' : '2rem',
                backgroundColor: 'var(--background-color)',
                transition: 'margin-left 0.3s ease',
                width: '100%' // Ensure full width
            }}>
                <header style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: '2rem',
                    gap: isMobile ? '1rem' : '0'
                }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{getTabTitle()}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                                {getTabDescription()}
                            </p>
                            {!isMobile && <span style={{ color: '#ccc' }}>•</span>}
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button
                                onClick={loadData}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'var(--card-bg)',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: 'var(--text-color)',
                                    fontSize: '0.9rem',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                                    color: 'var(--text-color)',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    boxShadow: 'var(--shadow)',
                                    flex: isMobile ? 1 : 'initial',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>

                            {/* Export Button - Toggleable */}
                            {clientConfig?.features?.allowExport !== false && (
                                <button
                                    onClick={handleExport}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--card-bg)',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: 'var(--text-color)',
                                        fontSize: '0.9rem',
                                        boxShadow: 'var(--shadow)',
                                        flex: isMobile ? 1 : 'initial',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <Download size={16} />
                                    Export CSV
                                </button>
                            )}
                        </div>

                        <div style={{ width: isMobile ? '100%' : 'auto' }}>
                            <DateFilter
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                            />
                        </div>
                    </div>
                </header>

                <main>
                    {activeTab === 'overview' && <Overview stats={stats} chartData={chartData} config={clientConfig} />}
                    {activeTab === 'framework' && (
                        <DataTable
                            data={filteredFramework}
                            columns={clientConfig?.tables?.framework?.columns}
                        />
                    )}
                    {activeTab === 'checkout' && (
                        <DataTable
                            data={filteredCheckout}
                            showAmount={true}
                            columns={clientConfig?.tables?.transactions?.columns}
                        />
                    )}
                    {activeTab === 'openLeads' && (
                        <DataTable
                            data={filteredOpenLeads}
                            columns={clientConfig?.tables?.openLeads?.columns}
                        />
                    )}
                </main>
            </div>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
