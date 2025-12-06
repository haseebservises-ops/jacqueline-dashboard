import React from 'react';
import { LayoutDashboard, Users, ShoppingCart, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, isCollapsed, toggleSidebar, isMobile }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'framework', label: 'Framework', icon: Users },
        { id: 'checkout', label: 'Framework Checkout', icon: ShoppingCart },
        { id: 'openLeads', label: 'Framework Open Leads', icon: UserMinus },
    ];

    const sidebarWidth = isCollapsed ? '80px' : '280px';

    return (
        <>
            {isMobile && !isCollapsed && (
                <div
                    className="sidebar-overlay"
                    onClick={toggleSidebar}
                />
            )}
            <div style={{
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
                        <img src="/logo2.png" alt="Logo" style={{ height: '120px', transition: 'height 0.3s', maxWidth: '100%', objectFit: 'contain' }} />
                    )}
                    {isCollapsed && (
                        <img src="/logo2.png" alt="Logo" style={{ height: '40px', transition: 'height 0.3s' }} />
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
                                onClick={() => onTabChange(item.id)}
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
            </div>
        </>
    );
};

export default Sidebar;
