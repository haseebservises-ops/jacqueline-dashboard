import React from 'react';
import { CreditCard } from 'lucide-react'; // Fallback icon

const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color || 'var(--primary-color)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{title}</h3>
                {Icon && <Icon size={20} color={color || 'var(--primary-color)'} />}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                {value}
            </div>
        </div>
    );
};

export default StatsCard;
