import React from 'react';
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import { Users, ShoppingBag, DollarSign, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const WIDGET_REGISTRY = {
    'StatsCard': StatsCard,
    'SalesChart': SalesChart
};

const ICON_MAP = {
    'Users': Users,
    'ShoppingBag': ShoppingBag,
    'DollarSign': DollarSign,
    'Percent': Percent
};

// Default "Jacqueline" Layout
const DEFAULT_LAYOUT = [
    {
        type: 'StatsCard',
        props: { title: 'Total Fillups', valueKey: 'totalFillups', icon: 'Users', color: 'blue' }
    },
    {
        type: 'StatsCard',
        props: { title: 'Total Purchases', valueKey: 'totalPurchases', icon: 'ShoppingBag', color: 'green' }
    },
    {
        type: 'StatsCard',
        props: { title: 'Conversion Rate', valueKey: 'conversionRate', icon: 'Percent', color: 'purple' }
    },
    {
        type: 'StatsCard',
        props: { title: 'Total Revenue', valueKey: 'totalRevenue', icon: 'DollarSign', color: 'orange', isCurrency: true }
    },
    {
        type: 'SalesChart',
        props: { title: 'Sales Over Time' }
    }
];

const Overview = ({ stats, chartData, config }) => {
    // Merge DB config with Default if undefined (Fallback Strategy)
    const layout = (config && config.widgets) ? config.widgets : DEFAULT_LAYOUT;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {layout.filter(w => w.type === 'StatsCard').map((widget, index) => {
                    const Component = WIDGET_REGISTRY[widget.type];
                    // Dynamic Value Lookup: stats['totalRevenue']
                    const value = stats[widget.props.valueKey];
                    const Icon = ICON_MAP[widget.props.icon];

                    return (
                        <motion.div key={index} variants={item} style={{ flex: '1 1 200px' }}>
                            <div className="glass-card" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Component
                                    title={widget.props.title}
                                    value={value !== undefined ? value : 0} // Safely access value
                                    icon={Icon}
                                    color={widget.props.color}
                                    isCurrency={widget.props.isCurrency}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {layout.filter(w => w.type === 'SalesChart').map((widget, index) => {
                const Component = WIDGET_REGISTRY[widget.type];
                return (
                    <motion.div key={index} variants={item}>
                        <div className="glass-card">
                            <Component data={chartData} title={widget.props.title} />
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default Overview;
