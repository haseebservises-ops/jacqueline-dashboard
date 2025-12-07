import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Save, Search, AlertCircle, CheckCircle, Send, ArrowLeft, Settings, ToggleLeft, Palette, Code, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Core Data
    const [email, setEmail] = useState('');
    const [spreadsheetId, setSpreadsheetId] = useState('');

    // Visual State
    const [branding, setBranding] = useState({ logoUrl: '', primaryColor: '#ff4500' });
    const [features, setFeatures] = useState({
        showOverview: true,
        showFramework: true,
        showCheckout: true,
        showOpenLeads: true,
        allowExport: true
    });

    const [configInput, setConfigInput] = useState({}); // For Settings Tab inputs
    const [tabs, setTabs] = useState([]); // Universal Tabs Config
    const [subscription, setSubscription] = useState({ endDate: '' }); // Subscription Config

    // Initial Load for Admin Settings
    useEffect(() => {
        const fetchAdminSettings = async () => {
            if (user?.email === 'haseebservises@gmail.com') {
                const { data } = await supabase
                    .from('clients')
                    .select('config')
                    .eq('email', 'haseebservises@gmail.com')
                    .single();

                if (data?.config) {
                    setConfigInput(data.config);
                }
            }
        };
        fetchAdminSettings();
    }, [user]);

    // Advanced/Legacy Config (Tables, etc.)
    const [advancedConfig, setAdvancedConfig] = useState('{}');
    const [activeTab, setActiveTab] = useState('orders'); // Default to 'orders' since that's where action is

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [recentClients, setRecentClients] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]); // Store pending client orders

    useEffect(() => {
        const saved = localStorage.getItem('recent_clients');
        if (saved) {
            try {
                setRecentClients(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent_clients", e);
                localStorage.removeItem('recent_clients');
            }
        }
        loadPendingOrders();
    }, []);

    const loadPendingOrders = async () => {
        // Since we are storing status in the JSON 'config' field, we need to fetch all and filter
        // Or if Supabase supports filtering inside JSONB?
        // Let's try simple fetch all for now, assuming client list is small (<100) or check docs.
        // Supabase JS filter on JSON: .contains('config', { status: 'pending' })
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*'); // We'll filter in JS for safety as JSON syntax varies

            if (data) {
                const pending = data.filter(c => c.config && c.config.status === 'pending');
                setPendingOrders(pending || []);
            } else {
                setPendingOrders([]);
            }
        } catch (err) {
            console.error("Error loading pending orders:", err);
            setPendingOrders([]);
        }
    };

    const handleApprove = async (order) => {
        setLoading(true);
        setMessage(null);
        try {
            // 1. Update status to 'active'
            const newConfig = {
                ...order.config,
                status: 'active'
            };

            // 2. Set spreadsheet_id if missing (optional: set a default one?)
            // For now we just activate access.

            const { error } = await supabase
                .from('clients')
                .update({ config: newConfig })
                .eq('email', order.email);

            if (error) throw error;

            // 3. Send Invite
            const { error: inviteError } = await supabase.auth.signInWithOtp({
                email: order.email,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard'
                }
            });
            if (inviteError) throw inviteError;

            if (inviteError) throw inviteError;

            toast.success(`Approved ${order.email} and sent invite!`);

            // Refresh list
            loadPendingOrders();
            addToRecents(order.email);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addToRecents = (emailToAdd) => {
        if (!emailToAdd) return;
        const updated = [emailToAdd, ...recentClients.filter(e => e !== emailToAdd)].slice(0, 5); // Keep last 5
        setRecentClients(updated);
        localStorage.setItem('recent_clients', JSON.stringify(updated));
    };

    const removeFromRecents = (e, emailToRemove) => {
        e.stopPropagation();
        const updated = recentClients.filter(e => e !== emailToRemove);
        setRecentClients(updated);
        localStorage.setItem('recent_clients', JSON.stringify(updated));
    };

    const parseConfig = (configObj) => {
        // Extract Branding
        setBranding({
            logoUrl: configObj.branding?.logoUrl || '',
            primaryColor: configObj.branding?.primaryColor || '#ff4500'
        });

        // Extract Features
        setFeatures({
            showOverview: configObj.features?.showOverview !== false,
            showFramework: configObj.features?.showFramework !== false,
            showCheckout: configObj.features?.showCheckout !== false,
            showOpenLeads: configObj.features?.showOpenLeads !== false,
            allowExport: configObj.features?.allowExport !== false,
        });


        // Extract Tabs (Universal)
        setTabs(configObj.tabs || []);

        // Extract Subscription
        setSubscription({
            endDate: configObj.subscription?.endDate || ''
        });

        // Keep the rest in Advanced
        const rest = { ...configObj };
        delete rest.branding;
        delete rest.features;
        delete rest.tabs;
        delete rest.subscription;
        setAdvancedConfig(JSON.stringify(rest, null, 2));
    };

    const loadClient = async (clientEmail) => {
        if (!clientEmail) return;
        setLoading(true);
        setMessage(null);
        setEmail(clientEmail); // Update input
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('email', clientEmail)
                .single();

            if (data) {
                setSpreadsheetId(data.spreadsheet_id || '');
                if (data.config) {
                    parseConfig(data.config);
                } else {
                    parseConfig({});
                }
                setMessage({ type: 'success', text: 'Client found! Details loaded.' });
                addToRecents(clientEmail);
            } else {
                setMessage({ type: 'info', text: 'New client (or not found). Defaults loaded.' });
                parseConfig({});
                setSpreadsheetId('');
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'info', text: 'Client not found. Ready to create new.' });
            parseConfig({});
            setSpreadsheetId('');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => loadClient(email);

    const handleInvite = async () => {
        if (!email) return;
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
            setMessage({ type: 'success', text: `Invite sent to ${email}!` });
            addToRecents(email);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            // Fetch current admin data first to preserve other fields
            const { data: adminData } = await supabase
                .from('clients')
                .select('config')
                .eq('email', 'haseebservises@gmail.com')
                .single();

            const currentConfig = adminData?.config || {};

            // Merge new email settings
            const newConfig = {
                ...currentConfig,
                emailSettings: configInput.emailSettings
            };

            const { error } = await supabase
                .from('clients')
                .update({ config: newConfig })
                .eq('email', 'haseebservises@gmail.com');

            if (error) throw error;
            toast.success("Settings saved successfully!");
        } catch (err) {
            toast.error("Failed to save settings: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            let baseConfig = {};
            try {
                baseConfig = JSON.parse(advancedConfig);
            } catch (err) {
                throw new Error('Invalid JSON in Advanced Configuration tab.');
            }

            const finalConfig = {
                ...baseConfig,
                branding,
                features,
                tabs,
                subscription
            };

            const payload = {
                email,
                spreadsheet_id: spreadsheetId,
                config: finalConfig,
            };

            const { error } = await supabase
                .from('clients')
                .upsert(payload, { onConflict: 'email' });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Configuration saved successfully!' });
            addToRecents(email);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    padding: '0'
                }}
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Sidebar: Recent Clients */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Users size={18} /> Recent Clients
                    </h3>
                    {recentClients.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: '#ccc', fontStyle: 'italic' }}>No recent clients.</p>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {recentClients.map(clientEmail => (
                            <li key={clientEmail}
                                onClick={() => loadClient(clientEmail)}
                                style={{
                                    padding: '0.75rem',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: email === clientEmail ? '#f0f9ff' : 'transparent',
                                    color: email === clientEmail ? 'var(--primary-color)' : 'var(--text-color)',
                                    borderRadius: '4px'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                    {clientEmail}
                                </span>
                                <Trash2
                                    size={14}
                                    color="#9ca3af"
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => removeFromRecents(e, clientEmail)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Main Content Area: Switch between Settings Mode and Client Config Mode */}

                {activeTab === 'settings' ? (
                    /* SETTINGS MODE */
                    <div className="glass-card"> {/* Re-use card style but for settings */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                            <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#666' }}>
                                <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Settings size={24} className="text-primary" /> System Settings
                            </h2>
                        </div>

                        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Send size={20} /> Email Notifications (EmailJS)
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    Configure this to receive email alerts automatically when a new order is placed.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Service ID</label>
                                        <input
                                            type="text"
                                            placeholder="service_xxxxx"
                                            value={configInput?.emailSettings?.serviceId || ''}
                                            onChange={(e) => setConfigInput(prev => ({
                                                ...prev,
                                                emailSettings: { ...prev.emailSettings || {}, serviceId: e.target.value }
                                            }))}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Template ID</label>
                                        <input
                                            type="text"
                                            placeholder="template_xxxxx"
                                            value={configInput?.emailSettings?.templateId || ''}
                                            onChange={(e) => setConfigInput(prev => ({
                                                ...prev,
                                                emailSettings: { ...prev.emailSettings || {}, templateId: e.target.value }
                                            }))}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Public Key</label>
                                        <input
                                            type="text"
                                            placeholder="Doing_xxxxx"
                                            value={configInput?.emailSettings?.publicKey || ''}
                                            onChange={(e) => setConfigInput(prev => ({
                                                ...prev,
                                                emailSettings: { ...prev.emailSettings || {}, publicKey: e.target.value }
                                            }))}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveConfig}
                                disabled={loading}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'wait' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginTop: '2rem'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Settings'} <Save size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* CLIENT CONFIG MODE (Standard View) */
                    <div className="glass-card">
                        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Settings className="text-primary" />
                                Admin Panel
                            </h2>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>Configure client dashboards, branding, and features.</p>
                        </div>

                        {message && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: message.type === 'error' ? '#fee2e2' : (message.type === 'success' ? '#dcfce7' : '#eff6ff'),
                                color: message.type === 'error' ? '#991b1b' : (message.type === 'success' ? '#166534' : '#1e40af')
                            }}>
                                {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        {/* Client Search */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Load Client Profile</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter client email..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={loading || !email}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'var(--text-color)',
                                    color: 'var(--background-color)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 600
                                }}
                            >
                                <Search size={18} />
                                Load
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Main Config Area */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Spreadsheet ID (Data Source)</label>
                                <input
                                    type="text"
                                    value={spreadsheetId}
                                    onChange={(e) => setSpreadsheetId(e.target.value)}
                                    placeholder="2PACX-..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'monospace' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                    File -&gt; Share -&gt; Publish to Web -&gt; CSV -&gt; Copy ID from URL
                                </p>
                            </div>

                            {/* Tabs for Visual vs Advanced vs Orders vs Universal */}
                            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('orders')}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'orders' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Users size={18} />
                                    Orders ({pendingOrders.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('universal')}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'universal' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: activeTab === 'universal' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <ToggleLeft size={18} />
                                    Universal Builder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('visual')}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'visual' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: activeTab === 'visual' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Palette size={18} />
                                    Visual / Branding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('advanced')}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'advanced' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: activeTab === 'advanced' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Code size={18} />
                                    Advanced JSON
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('settings')}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'none',
                                        borderBottom: activeTab === 'settings' ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: activeTab === 'settings' ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Settings size={18} />
                                    System
                                </button>
                            </div>

                            {/* Tab Content Rendering */}
                            {activeTab === 'orders' ? (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pending Orders</h3>
                                    {(!Array.isArray(pendingOrders) || pendingOrders.length === 0) ? (
                                        <p style={{ color: '#666', fontStyle: 'italic' }}>No pending orders.</p>
                                    ) : (
                                        pendingOrders.map((order) => (
                                            <div key={order.email} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{order.config?.name || 'Unknown Name'}</div>
                                                    <div style={{ color: '#666', fontSize: '0.9rem' }}>{order.email}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                                                        Transaction ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#333' }}>{order.config?.transactionId || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(order)}
                                                    disabled={loading}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: '#16a34a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : activeTab === 'universal' ? (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ToggleLeft size={20} /> Universal Builder
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                        Define the TABS and DATA Source for this client.
                                        Requires <b>Spreadsheet ID</b> to be set above.
                                    </p>

                                    {/* Tabs List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {tabs.map((tab, index) => (
                                            <div key={index} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                                                {/* Tab Basic Info */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tab ID (internal)</label>
                                                        <input
                                                            type="text"
                                                            value={tab.id}
                                                            onChange={(e) => {
                                                                const newTabs = [...tabs];
                                                                newTabs[index].id = e.target.value;
                                                                setTabs(newTabs);
                                                            }}
                                                            placeholder="e.g. students"
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Display Label</label>
                                                        <input
                                                            type="text"
                                                            value={tab.label}
                                                            onChange={(e) => {
                                                                const newTabs = [...tabs];
                                                                newTabs[index].label = e.target.value;
                                                                setTabs(newTabs);
                                                            }}
                                                            placeholder="e.g. Students 2024"
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>GID (Sheet ID)</label>
                                                        <input
                                                            type="text"
                                                            value={tab.gid}
                                                            onChange={(e) => {
                                                                const newTabs = [...tabs];
                                                                newTabs[index].gid = e.target.value;
                                                                setTabs(newTabs);
                                                            }}
                                                            placeholder="0"
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this tab?')) {
                                                                const newTabs = tabs.filter((_, i) => i !== index);
                                                                setTabs(newTabs);
                                                            }
                                                        }}
                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                {/* Column Mapper UI */}
                                                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Column Mapper</h4>

                                                    {(!tab.columns || tab.columns.length === 0) && (
                                                        <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                                            No columns defined. Table will use auto-detected columns (defaults).
                                                        </p>
                                                    )}

                                                    {(tab.columns || []).map((col, colIdx) => (
                                                        <div key={colIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Sheet Header (e.g. 'Student Name')"
                                                                value={col.key || ''} // In our service, we use the header as the key usually, but let's stick to key=SheetHeader
                                                                onChange={(e) => {
                                                                    const newTabs = [...tabs];
                                                                    if (!newTabs[index].columns) newTabs[index].columns = [];
                                                                    newTabs[index].columns[colIdx] = { ...col, key: e.target.value };
                                                                    setTabs(newTabs);
                                                                }}
                                                                style={{ padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Display Label (e.g. 'Name')"
                                                                value={col.label || col.header || ''}
                                                                onChange={(e) => {
                                                                    const newTabs = [...tabs];
                                                                    newTabs[index].columns[colIdx] = { ...col, label: e.target.value, header: e.target.value };
                                                                    setTabs(newTabs);
                                                                }}
                                                                style={{ padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                                                            />
                                                            <select
                                                                value={col.type || 'text'}
                                                                onChange={(e) => {
                                                                    const newTabs = [...tabs];
                                                                    newTabs[index].columns[colIdx] = { ...col, type: e.target.value };
                                                                    setTabs(newTabs);
                                                                }}
                                                                style={{ padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' }}
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="date">Date</option>
                                                                <option value="badge">Status Badge</option>
                                                                <option value="currency">Money ($)</option>
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTabs = [...tabs];
                                                                    newTabs[index].columns = newTabs[index].columns.filter((_, i) => i !== colIdx);
                                                                    setTabs(newTabs);
                                                                }}
                                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTabs = [...tabs];
                                                            if (!newTabs[index].columns) newTabs[index].columns = [];
                                                            newTabs[index].columns.push({ key: '', label: '', type: 'text' });
                                                            setTabs(newTabs);
                                                        }}
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--primary-color)',
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: '0',
                                                            marginTop: '0.5rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        + Add Column
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setTabs([...tabs, { id: `tab_${Date.now()}`, label: 'New Tab', gid: '0' }])}
                                            style={{
                                                padding: '0.75rem',
                                                border: '1px dashed var(--primary-color)',
                                                color: 'var(--primary-color)',
                                                background: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            + Add New Tab
                                        </button>
                                    </div>
                                </div>
                            ) : activeTab === 'visual' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    {/* Branding Section */}
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Palette size={20} /> Branding
                                        </h3>
                                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px' }}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Logo URL</label>
                                                <input
                                                    type="text"
                                                    value={branding.logoUrl}
                                                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                                                    placeholder="/logo2.png or https://..."
                                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Primary Color</label>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <input
                                                        type="color"
                                                        value={branding.primaryColor}
                                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                                        style={{ height: '40px', width: '80px', padding: 0, border: 'none', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontFamily: 'monospace' }}>{branding.primaryColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subscription Section */}
                                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertCircle size={20} /> Subscription Management
                                            </h3>
                                            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Subscription End Date</label>
                                                <input
                                                    type="date"
                                                    value={subscription.endDate}
                                                    onChange={(e) => setSubscription({ ...subscription, endDate: e.target.value })}
                                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%', maxWidth: '300px' }}
                                                />
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                    Use this to automatically lock the client out after this date. Set to empty to disable lockout.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Features Section */}
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ToggleLeft size={20} /> Features
                                            </h3>
                                            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {Object.keys(features).map(key => (
                                                    <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                                        <span style={{ fontSize: '0.95rem' }}>
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={features[key]}
                                                            onChange={(e) => setFeatures({ ...features, [key]: e.target.checked })}
                                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ADVANCED TAB */
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Code size={20} /> Advanced Configuration
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                        Use this JSON editor to define dynamic columns for tables.
                                        (Branding and Feature settings are managed in the Visual Editor).
                                    </p>
                                    <textarea
                                        value={advancedConfig}
                                        onChange={(e) => setAdvancedConfig(e.target.value)}
                                        rows={15}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem',
                                            backgroundColor: '#282c34',
                                            color: '#abb2bf',
                                            whiteSpace: 'pre'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 2,
                                        padding: '1rem',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Save size={20} />
                                    {loading ? 'Saving Changes...' : 'Save Configuration'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleInvite}
                                    disabled={loading || !email}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        color: 'var(--primary-color)',
                                        border: '2px solid var(--primary-color)',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Send size={20} />
                                    Invite
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
