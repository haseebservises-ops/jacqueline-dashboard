import React from 'react';
import { Lock, Mail } from 'lucide-react';

const SubscriptionExpired = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'var(--background-color, #f4f4f5)',
            color: 'var(--text-color, #333)',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'var(--card-bg, white)',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#fee2e2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Lock size={40} color="#dc2626" />
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>Access Locked</h1>
                <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Your subscription has expired. Please contact your administrator to renew your plan and regain access to your dashboard.
                </p>

                <a
                    href="mailto:haseebservises@gmail.com?subject=Renew Subscription Request"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'var(--primary-color, #ff4500)',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Mail size={20} />
                    Contact Support
                </a>
            </div>
        </div>
    );
};

export default SubscriptionExpired;
