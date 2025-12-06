import React from 'react';
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import { Users, ShoppingBag, DollarSign, Percent } from 'lucide-react';

const Overview = ({ stats, chartData }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <StatsCard
                    title="Total Fillups"
                    value={stats.totalFillups}
                    icon={Users}
                    color="#3B82F6"
                />
                <StatsCard
                    title="Total Purchases"
                    value={stats.totalPurchases}
                    icon={ShoppingBag}
                    color="#10B981"
                />
                <StatsCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    icon={Percent}
                    color="#8B5CF6"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="#F59E0B"
                />
            </div>

            <SalesChart data={chartData} />
        </div>
    );
};

export default Overview;
