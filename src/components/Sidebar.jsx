import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingCart, UserMinus, ChevronLeft, ChevronRight, Moon, Sun, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, onTabChange, isCollapsed, toggleSidebar, isMobile, branding, features }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Add navigation logic to redirect after logout (optional since auth state change usually triggers re-render/redirect)
    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const [isClientView, setIsClientView] = useState(false);

    // Default to TRUE if features prop is missing (backward compatibility)
    // BUT if user is Admin, we only show these if isClientView is TRUE
    const isAdmin = user?.email === 'haseebservises@gmail.com';

    // For normal users, respect flags. For Admin, respect flags ONLY if isClientView is true.
    const shouldShow = (featureFlag) => {
        if (isAdmin && !isClientView) return false;
        return features?.[featureFlag] !== false;
    };

    const showOverview = shouldShow('showOverview');
    const showFramework = shouldShow('showFramework');
    const showCheckout = shouldShow('showCheckout');
    const showOpenLeads = shouldShow('showOpenLeads');

    const menuItems = [];

    if (showOverview) menuItems.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
    if (showFramework) menuItems.push({ id: 'framework', label: 'Framework', icon: Users });
    if (showCheckout) menuItems.push({ id: 'checkout', label: 'Framework Checkout', icon: ShoppingCart });
    if (showOpenLeads) menuItems.push({ id: 'openLeads', label: 'Framework Open Leads', icon: UserMinus });

    if (isAdmin) {
        menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
    }

    const sidebarWidth = isCollapsed ? '80px' : '280px';
    const logoSrc = branding?.logoUrl || "/logo2.png";

    return (
        <>
            {isMobile && !isCollapsed && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}
            <div
                className="glass-sidebar"
                style={{
                    width: sidebarWidth,
                    backgroundColor: 'var(--card-bg)',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    borderRight: '1px solid #eee',
                    padding: '2rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s ease',
                    zIndex: 100,
                    // On mobile, if collapsed, we might want to hide it completely or show just icons depending on design.
                    // For now, let's assume collapsed means hidden on very small screens or just icons.
                    // If isMobile is true, we might want to overlay.
                    transform: isMobile && isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
                }}>
                <div style={{
                    marginBottom: '3rem',
                    paddingLeft: isCollapsed ? '0' : '1rem',
                    display: 'flex',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    alignItems: 'center'
                }}>
                    {!isCollapsed && (
                        <img src={logoSrc} alt="Logo" style={{ height: '120px', transition: 'height 0.3s', maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                    {isCollapsed && (
                        <img src={logoSrc} alt="Logo" style={{ height: '40px', transition: 'height 0.3s' }} />
                    )}

                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: '5px',
                                display: isCollapsed ? 'none' : 'block' // Hide toggle when collapsed if we want to toggle from outside or use a different mechanism. 
                                // Actually, let's keep it visible or move it. 
                                // Better UI: Toggle button always visible at top or bottom.
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                {/* Toggle button for collapsed state to expand */}
                {isCollapsed && !isMobile && (
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            marginBottom: '2rem',
                            alignSelf: 'center'
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                )}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'admin') {
                                        navigate('/admin');
                                    } else {
                                        onTabChange(item.id);
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    gap: '1rem',
                                    padding: '0.8rem 1rem',
                                    border: 'none',
                                    background: isActive ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 600 : 500,
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                                title={item.label}
                            >
                                <Icon size={24} style={{ minWidth: '24px' }} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: isCollapsed ? 'center' : 'stretch'
                }}>
                    {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.email}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {user?.email === 'haseebservises@gmail.com' ? (
                                        <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '2px' }}><Shield size={10} /> Admin</span>
                                    ) : 'User'}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center'
                        }}
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {!isCollapsed && <span style={{ fontSize: '0.9rem' }}>{isDarkMode ? 'Light' : 'Dark'}</span>}
                    </button>

                    <button
                        onClick={logout}
                        style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            marginTop: '0.25rem'
                        }}
                        title="Sign Out"
                    >
                        {!isCollapsed && <span style={{ fontSize: '0.9rem' }}>Sign Out</span>}
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setIsClientView(!isClientView)}
                            style={{
                                background: isClientView ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                                border: '1px border #ccc',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: isClientView ? 'var(--primary-color)' : 'var(--text-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                justifyContent: 'center',
                                marginTop: '0.5rem',
                                fontSize: '0.85rem'
                            }}
                            title="Toggle Client View"
                        >
                            {isClientView ? <EyeOff size={16} /> : <Eye size={16} />}
                            {!isCollapsed && <span>{isClientView ? 'Exit Preview' : 'Preview Client'}</span>}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
