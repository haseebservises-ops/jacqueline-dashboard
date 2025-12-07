import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchDashboardData, fetchUniversalData } from '../services/dataService';
import DateFilter from './DateFilter';
import Sidebar from './Sidebar';
import Overview from './Overview';
import SkeletonLoader from './SkeletonLoader';
import DataTable from './DataTable';
import { RefreshCw, Menu, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

import { useNavigate } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

const Dashboard = () => {
    const { user } = useAuth();
    // ... existing hooks ...
    const navigate = useNavigate();
    // Data State: stores { framework: [], checkout: ... } OR { tabId1: [], tabId2: [] }
    const [data, setData] = useState({});
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
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('spreadsheet_id, config')
                .eq('email', user.email)
                .single();

            if (clientError || !clientData) {
                if (user?.email === 'haseebservises@gmail.com') {
                    // Fallback for Admin
                    console.log("Admin fallback: No config found, using default.");
                    setClientConfig({
                        branding: { primaryColor: '#ff4500', logoUrl: '/src/assets/logo.png' },
                        features: { showOverview: true, showFramework: true, showCheckout: true, showOpenLeads: true, allowExport: true }
                    });
                    setData({ framework: [], checkout: [], openLeads: [] });
                    setLastUpdated(new Date());
                    setLoading(false);
                    setIsRefreshing(false);
                    return;
                }
                throw new Error('No configuration found for this user.');
            }

            if (!clientData?.spreadsheet_id) throw new Error('No Spreadsheet ID linked to this account.');

            // Force Admin Branding Override
            if (user?.email === 'haseebservises@gmail.com') {
                clientData.config.branding = {
                    primaryColor: '#ff4500',
                    logoUrl: '/src/assets/logo.png'
                };
            }

            setClientConfig(clientData.config);

            // 2. Fetch Data (Universal vs Legacy)
            let result;
            const tabsConfig = clientData.config?.tabs;

            if (tabsConfig && Array.isArray(tabsConfig) && tabsConfig.length > 0) {
                // UNIVERSAL MODE
                result = await fetchUniversalData(clientData.spreadsheet_id, tabsConfig);
            } else {
                // LEGACY MODE (Framework/Checkout hardcoding)
                result = await fetchDashboardData(clientData.spreadsheet_id);
            }

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

    // Apply Custom Branding
    useEffect(() => {
        if (clientConfig?.branding?.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', clientConfig.branding.primaryColor);
        } else {
            document.documentElement.style.removeProperty('--primary-color');
        }
    }, [clientConfig]);

    // Handle Mobile
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
            else setIsSidebarCollapsed(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generic Data Filter
    const filterData = (dataset) => {
        if (!dataset || !Array.isArray(dataset)) return [];
        return dataset.filter(item => {
            if (startDate || endDate) {
                // Try to find a date object. 
                // Legacy: item.DateObj
                // Universal: We might need to map it or it's raw string? 
                // For now, let's look for 'Date' prop or assume item has DateObj if parsed by legacy
                let itemDate = item.DateObj;

                // Try to parse 'Date' field if DateObj is missing (Universal fallback)
                if (!itemDate && item.Date) {
                    const d = new Date(item.Date);
                    if (!isNaN(d.getTime())) itemDate = d;
                }

                if (!itemDate) return true; // Show if no date found (safe default)

                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            }
            return true;
        });
    };

    // Calculate Stats (Universal via widgets config or Legacy hardcoded)
    const stats = useMemo(() => {
        // If Universal Widgets defined in config, Overview component handles it. 
        // But for Legacy fallback, we calculate here.
        // Actually, Overview.jsx expects { totalFillups: ... } etc

        // LEGACY STATS CALCULATION
        const fw = data.framework || [];
        const ch = data.checkout || [];
        const filteredFw = filterData(fw);
        const filteredCh = filterData(ch);

        const totalFillups = filteredFw.length;
        const totalPurchases = filteredCh.length;
        const totalRevenue = filteredCh.reduce((sum, item) => sum + (item.Amount || 0), 0);
        const conversionRate = totalFillups > 0 ? ((totalPurchases / totalFillups) * 100).toFixed(1) : 0;

        return {
            totalFillups,
            totalPurchases,
            totalRevenue,
            conversionRate
        };
    }, [data, startDate, endDate]);

    // Helper to get export data
    const getActiveData = useCallback(() => {
        const rawData = data[activeTab];
        return filterData(rawData);
    }, [activeTab, data, startDate, endDate]);

    const handleExport = () => {
        const dataToExport = getActiveData();
        if (!dataToExport || dataToExport.length === 0) {
            alert('No data to export!');
            return;
        }
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];
        for (const row of dataToExport) {
            const values = headers.map(header => {
                const val = row[header] || '';
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

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    // Render Logic
    const getTabTitle = () => {
        // Universal lookup
        if (clientConfig?.tabs) {
            const t = clientConfig.tabs.find(t => t.id === activeTab);
            if (t) return t.label || t.name;
        }
        // Legacy Fallback
        switch (activeTab) {
            case 'overview': return 'Dashboard Overview';
            case 'framework': return 'Framework Leads';
            case 'checkout': return 'Framework Checkout';
            case 'openLeads': return 'Framework Open Leads';
            default: return 'Dashboard';
        }
    };

    const isUniversal = clientConfig?.tabs && Array.isArray(clientConfig.tabs) && clientConfig.tabs.length > 0;

    if (loading && (!data || Object.keys(data).length === 0)) {
        return <LoadingStub />;
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem', background: 'var(--background-color)', color: 'var(--text-color)' }}>
                <h3>Configuration Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
            </div>
        );
    }

    const mainContentMargin = isMobile ? '0' : (isSidebarCollapsed ? '80px' : '280px');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <Helmet>
                <title>{getTabTitle()} | CoachFlow Dashboard</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            {/* Background Gradients */}
            <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '800px', height: '800px', backgroundColor: '#6366f1', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '800px', height: '800px', backgroundColor: '#ec4899', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, borderRadius: '50%', pointerEvents: 'none' }} />

            {isMobile && (
                <button onClick={toggleSidebar} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 101, background: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem', boxShadow: 'var(--shadow)', display: isSidebarCollapsed ? 'block' : 'none' }}>
                    <Menu size={24} />
                </button>
            )}

            <Sidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                    setActiveTab(tab);
                    if (isMobile) setIsSidebarCollapsed(true);
                }}
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
                branding={clientConfig?.branding}
                features={clientConfig?.features}
                tabs={clientConfig?.tabs} // Pass tabs to sidebar
            />

            <div style={{ flex: 1, marginLeft: mainContentMargin, padding: isMobile ? '4rem 1rem 1rem 1rem' : '2rem', backgroundColor: 'var(--background-color)', transition: 'margin-left 0.3s ease', width: '100%' }}>
                <header style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '2rem', gap: isMobile ? '1rem' : '0' }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{getTabTitle()}</h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>Updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: isRefreshing ? 'not-allowed' : 'pointer', color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: 500, boxShadow: 'var(--shadow)', flex: isMobile ? 1 : 'initial', whiteSpace: 'nowrap' }}>
                                <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            {clientConfig?.features?.allowExport !== false && (
                                <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card-bg)', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.9rem', boxShadow: 'var(--shadow)', flex: isMobile ? 1 : 'initial', whiteSpace: 'nowrap' }}>
                                    <Download size={16} /> Export CSV
                                </button>
                            )}
                        </div>
                        <div style={{ width: isMobile ? '100%' : 'auto' }}>
                            {/* Note: DateFilter is generic, works for both */}
                            <DateFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                        </div>
                    </div>
                </header>

                <main>
                    {activeTab === 'overview' && (
                        // Stats and ChartData need to be made generic in Overview.jsx 
                        // For now we pass 'stats' (legacy) - Universal will need to calculate its own stats in future via Widgets
                        <Overview stats={stats} chartData={[]} config={clientConfig} />
                    )}

                    {/* UNIVERSAL TAB RENDERER */}
                    {isUniversal && clientConfig.tabs.map(tab => {
                        if (activeTab !== tab.id) return null;
                        const tabData = data[tab.id] || [];
                        return (
                            <DataTable
                                key={tab.id}
                                data={filterData(tabData)}
                                columns={tab.columns} // If defined in config
                            />
                        );
                    })}

                    {/* LEGACY TAB RENDERER (Fallback) */}
                    {!isUniversal && (
                        <>
                            {activeTab === 'framework' && <DataTable data={filterData(data.framework)} columns={clientConfig?.tables?.framework?.columns} />}
                            {activeTab === 'checkout' && <DataTable data={filterData(data.checkout)} showAmount={true} columns={clientConfig?.tables?.transactions?.columns} />}
                            {activeTab === 'openLeads' && <DataTable data={filterData(data.openLeads)} columns={clientConfig?.tables?.openLeads?.columns} />}
                        </>
                    )}
                </main>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const LoadingStub = () => (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <SkeletonLoader width="100%" height="400px" borderRadius="12px" />
    </div>
);

export default Dashboard;
