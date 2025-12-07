import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, BarChart2, CheckCircle, ArrowRight, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendOrderEmail } from '../utils/emailService';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Save as a "Pending" client
            const payload = {
                email: email.toLowerCase(),
                spreadsheet_id: '', // Initialize with empty string to satisfy NOT NULL constraint
                config: {
                    status: 'pending',
                    name: name,
                    transactionId: transactionId,
                    // Default features
                    features: {
                        showOverview: true,
                        showFramework: true,
                        showCheckout: true,
                        showOpenLeads: true,
                        allowExport: true
                    }
                }
            };

            const { error } = await supabase
                .from('clients')
                .insert([payload]); // Use insert instead of upsert to avoid UPDATE RLS requirement for anonymous users

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Order received! We will verify the transaction and email you access shortly.'
            });
            setName('');
            setEmail('');
            setTransactionId('');

            // 2. Fetch Admin Config for Email Keys
            const { data: adminData } = await supabase
                .from('clients')
                .select('config')
                .eq('email', 'haseebservises@gmail.com')
                .single();

            // 3. Send Email Notification (Non-blocking)
            if (adminData?.config?.emailSettings) {
                await sendOrderEmail({
                    name,
                    email: email.toLowerCase(),
                    transactionId
                }, adminData.config.emailSettings);
            }

        } catch (err) {
            console.error(err);
            // Show actual error message for easier debugging
            setMessage({ type: 'error', text: err.message || 'Something went wrong. Please try again or contact support.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', color: '#1f2937', backgroundColor: '#fff' }}>
            {/* Header */}
            <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff4500' }}>
                    <BarChart2 fill="#ff4500" /> CoachFlow
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user?.email === 'haseebservises@gmail.com' && (
                        <button
                            onClick={() => navigate('/admin')}
                            style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, padding: '0.5rem 1rem', cursor: 'pointer', background: 'none', border: 'none' }}
                            title="For Admins"
                        >
                            Admin Panel
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/login')}
                        style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, border: '1px solid #e5e7eb', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'white' }}
                    >
                        {user ? 'Dashboard' : 'Client Login'}
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#fff7ed' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, color: '#111827' }}>
                        The Ultimate Dashboard for <span style={{ color: '#ff4500' }}>Coaches & Consultants</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Track your leads, manage Frameworks, and visualize your sales pipeline in one beautiful, customizable interface.
                    </p>
                    <a href="#buy" style={{ display: 'inline-block', padding: '1rem 2.5rem', backgroundColor: '#ff4500', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(255, 69, 0, 0.4)' }}>
                        Get Lifetime Access - $197
                    </a>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, marginBottom: '4rem' }}>Why Choose CoachFlow?</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#ff4500', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                            <BarChart2 />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Data Visualization</h3>
                        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>Instantly see your checkout conversion rates, open leads, and monthly performance at a glance.</p>
                    </div>
                    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#ff4500', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                            <Shield />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Secure & Customizable</h3>
                        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>Your data stays in your Google Sheet. We just visualize it. Whitelabel ready with your own branding.</p>
                    </div>
                    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#ff4500', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                            <CheckCircle />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Easy Setup</h3>
                        <p style={{ color: '#6b7280', lineHeight: 1.6 }}>Just connect your Google Sheet. No coding required. Admin panel included for easy management.</p>
                    </div>
                </div>
            </section>

            {/* Payment & Form */}
            <section id="buy" style={{ padding: '5rem 2rem', backgroundColor: '#111827', color: 'white' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                    {/* Bank Details */}
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>Get Access Now</h2>
                        <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1rem' }}>Payment Methods</h3>
                        <p style={{ color: '#e5e7eb', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            Please transfer <strong>$197 (or Equivalent PKR)</strong> to one of the accounts below:
                        </p>

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                            <h4 style={{ color: '#ec4899', fontSize: '1.1rem', marginBottom: '1rem' }}>Primary Bank (UBL)</h4>
                            <div style={{ marginBottom: '0.5rem', color: 'white' }}>
                                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Account Title:</span> <strong>Abdul Haseeb</strong>
                            </div>
                            <div style={{ color: 'white' }}>
                                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>IBAN:</span> <strong style={{ fontFamily: 'monospace' }}>PK82 UNIL 0109 0003 4011 1189</strong>
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ color: '#10b981', fontSize: '1.1rem', marginBottom: '1rem' }}>Secondary Banks</h4>
                            <div style={{ marginBottom: '1rem', color: 'white' }}>
                                <div style={{ marginBottom: '0.25rem', fontWeight: 600 }}>SadaPay</div>
                                <div style={{ fontFamily: 'monospace' }}>PK35 SADA 0000 0030 1781 4893</div>
                            </div>
                            <div style={{ color: 'white' }}>
                                <div style={{ marginBottom: '0.25rem', fontWeight: 600 }}>NayaPay</div>
                                <div style={{ fontFamily: 'monospace' }}>PK71 NAYA 1234 5030 1781 4893</div>
                            </div>
                        </div>

                        <p style={{ marginTop: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                            <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            Account Title: Haseeb Services / Abdul Haseeb
                        </p>
                    </div>

                    {/* Order Form */}
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', color: '#1f2937' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Confirm Your Order</h3>
                        {message && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                                color: message.type === 'error' ? '#991b1b' : '#166534',
                                fontSize: '0.9rem'
                            }}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleOrder}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Transaction ID</label>
                                <input
                                    type="text"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. TX-123456789"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    Please enter the reference ID from your banking app.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: '#ff4500',
                                    color: 'white',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Order'} <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
