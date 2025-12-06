import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchDashboardData } from '../services/dataService';
import DateFilter from './DateFilter';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Transactions from './Transactions';
import { RefreshCw, Menu } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState({ framework: [], checkout: [], openLeads: [] });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // UI State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const loadData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const result = await fetchDashboardData();
            setData(result);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [loadData]);

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

        return {
            totalFillups,
            totalPurchases,
            totalRevenue
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

    const getActiveData = () => {
        switch (activeTab) {
            case 'framework': return filteredFramework;
            case 'checkout': return filteredCheckout;
            case 'openLeads': return filteredOpenLeads;
            default: return [];
        }
    };

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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
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
                                disabled={isRefreshing}
                                style={{
                                    display: 'flex',
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
                                    flex: isMobile ? 1 : 'initial'
                                }}
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
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

                {activeTab === 'overview' ? (
                    <Overview stats={stats} chartData={chartData} />
                ) : (
                    <Transactions data={getActiveData()} showAmount={activeTab === 'checkout'} />
                )}
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
