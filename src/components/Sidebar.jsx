import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingCart, UserMinus, ChevronLeft, ChevronRight, Moon, Sun, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, onTabChange, isCollapsed, toggleSidebar, isMobile, branding, features, tabs }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const [isClientView, setIsClientView] = useState(false);
    const isAdmin = user?.email === 'haseebservises@gmail.com';

    const shouldShow = (featureFlag) => {
        if (isAdmin && !isClientView) return false;
        return features?.[featureFlag] !== false;
    };

    const showOverview = shouldShow('showOverview');
    const showFramework = shouldShow('showFramework');
    const showCheckout = shouldShow('showCheckout');
    const showOpenLeads = shouldShow('showOpenLeads');

    const menuItems = [];

    // Always show Overview? Or configurable? Assuming yes for now.
    if (showOverview) menuItems.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });

    // Universal Mode
    if (tabs && Array.isArray(tabs) && tabs.length > 0) {
        tabs.forEach(tab => {
            menuItems.push({
                id: tab.id,
                label: tab.label || tab.name,
                icon: Users // Generic icon for now, or add ability to pick icon in Admin
            });
        });
    } else {
        // Legacy Mode (Fallback)
        if (showFramework) menuItems.push({ id: 'framework', label: 'Framework', icon: Users });
        if (showCheckout) menuItems.push({ id: 'checkout', label: 'Framework Checkout', icon: ShoppingCart });
        if (showOpenLeads) menuItems.push({ id: 'openLeads', label: 'Framework Open Leads', icon: UserMinus });
    }

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
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    // Conditional Background: Dark Mode -> Gradient, Light Mode -> White/Glass
                    background: isDarkMode
                        ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)'
                        : 'rgba(255, 255, 255, 0.95)',
                    borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
                    padding: '2rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 100,
                    transform: isMobile && isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
                    backdropFilter: 'blur(12px)',
                    color: isDarkMode ? 'white' : 'var(--text-color)' // Set default text color
                }}>

                {/* Logo Section */}
                <div style={{
                    marginBottom: '3rem',
                    paddingLeft: isCollapsed ? '0' : '0.5rem',
                    display: 'flex',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={logoSrc} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                            <span style={{
                                fontSize: '1.2rem',
                                fontWeight: 800,
                                // Conditional Text Gradient
                                background: isDarkMode
                                    ? 'linear-gradient(90deg, #fff, #94a3b8)'
                                    : 'linear-gradient(90deg, #1e293b, #475569)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.5px'
                            }}>
                                CoachFlow
                            </span>
                        </div>
                    )}
                    {isCollapsed && (
                        <img src={logoSrc} alt="Logo" style={{ height: '32px', transition: 'height 0.3s' }} />
                    )}

                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            style={{
                                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex', // Always flex, never hide
                                zIndex: 101, // Ensure it's above everything when collapsed
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                position: 'absolute',
                                right: isCollapsed ? '-12px' : '-24px', // Adjust position when collapsed
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10
                            }}
                        >
                            <ChevronLeft size={14} />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        // Active Styles based on Theme
                        const activeBg = isDarkMode
                            ? 'linear-gradient(90deg, rgba(129, 140, 248, 0.15) 0%, rgba(129, 140, 248, 0.05) 100%)'
                            : 'rgba(129, 140, 248, 0.1)';

                        const activeColor = isDarkMode ? '#fff' : '#4338ca'; // Indigo-800 for light mode
                        const inactiveColor = 'var(--text-muted)';
                        const activeBorderLeft = '#818cf8';

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
                                    padding: '0.85rem 1rem',
                                    background: isActive ? activeBg : 'transparent',
                                    border: isActive && isDarkMode
                                        ? '1px solid rgba(129, 140, 248, 0.3)'
                                        : '1px solid transparent',
                                    borderLeft: isActive
                                        ? `3px solid ${activeBorderLeft}`
                                        : '3px solid transparent',
                                    color: isActive ? activeColor : inactiveColor,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: isActive ? 600 : 500,
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    boxShadow: isActive && isDarkMode ? '0 0 15px rgba(129, 140, 248, 0.1)' : 'none'
                                }}
                                title={item.label}
                            >
                                <Icon size={20} style={{ minWidth: '20px', color: isActive ? (isDarkMode ? '#818cf8' : '#4f46e5') : 'inherit' }} />
                                {!isCollapsed && <span>{item.label}</span>}
                                {isActive && !isCollapsed && isDarkMode && (
                                    <div style={{
                                        position: 'absolute',
                                        right: '10px',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#818cf8',
                                        boxShadow: '0 0 8px #818cf8'
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Floating Profile Card (Bottom) */}
                <div style={{
                    marginTop: 'auto',
                    padding: isCollapsed ? '0.5rem' : '1rem',
                    // Floating card look
                    background: isDarkMode
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                    border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isDarkMode
                        ? '0 10px 20px -5px rgba(0,0,0,0.3)'
                        : '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                }}>
                    {!isCollapsed && (
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px', // Squircle
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)', // Purple-Indigo gradient
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                            }}>
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {user?.email?.split('@')[0]}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: isAdmin ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        color: isAdmin ? '#fb7185' : '#818cf8',
                                        border: isAdmin ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)',
                                        fontWeight: 600
                                    }}>
                                        {isAdmin ? 'ADMIN' : 'PRO'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                flex: 1,
                                background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <button
                            onClick={logout}
                            style={{
                                flex: 1,
                                background: 'rgba(239, 68, 68, 0.1)', // Red tint
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: '#f87171',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>

                    {isAdmin && !isCollapsed && (
                        <button
                            onClick={() => setIsClientView(!isClientView)}
                            style={{
                                width: '100%',
                                marginTop: '0.5rem',
                                background: 'transparent',
                                border: '1px dashed var(--text-muted)',
                                borderRadius: '8px',
                                padding: '0.4rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isClientView ? <EyeOff size={14} /> : <Eye size={14} />}
                            {isClientView ? 'Exit Preview' : 'Preview Client'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
