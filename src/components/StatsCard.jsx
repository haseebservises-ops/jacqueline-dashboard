import React from 'react';
import { CreditCard } from 'lucide-react'; // Fallback icon
import CountUp from './CountUp';

const StatsCard = ({ title, value, icon: Icon, color, isCurrency }) => {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color || 'var(--primary-color)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{title}</h3>
                {Icon && <Icon size={20} color={color || 'var(--primary-color)'} />}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                {/* Check if value is numeric or string formatted money, let CountUp handle parsing */}
                <CountUp
                    value={value}
                    prefix={isCurrency ? '$' : ''}
                    suffix={isCurrency ? '' : (title.toLowerCase().includes('rate') ? '%' : '')}
                />
            </div>
        </div>
    );
};

export default StatsCard;
