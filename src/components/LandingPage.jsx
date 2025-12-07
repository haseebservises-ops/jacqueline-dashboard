import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, BarChart2, CheckCircle, ArrowRight, Zap, Star, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendOrderEmail } from '../utils/emailService';
import { Helmet } from 'react-helmet-async';
import dashboardMockup from '../assets/dashboard-mockup.png'; // Import the new image

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
            const payload = {
                email: email.toLowerCase(),
                spreadsheet_id: '',
                config: {
                    status: 'pending',
                    name: name,
                    transactionId: transactionId,
                    plan: 'monthly_pro',
                    features: {
                        showOverview: true,
                        showFramework: true,
                        showCheckout: true,
                        showOpenLeads: true,
                        allowExport: true
                    }
                }
            };

            const { error } = await supabase.from('clients').insert([payload]);
            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Request received! We will verify and email you shortly.'
            });
            setName('');
            setEmail('');
            setTransactionId('');

            const { data: adminData } = await supabase
                .from('clients')
                .select('config')
                .eq('email', 'haseebservises@gmail.com')
                .single();

            if (adminData?.config?.emailSettings) {
                await sendOrderEmail({ name, email: email.toLowerCase(), transactionId }, adminData.config.emailSettings);
            }

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.message || 'Error processing request.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', color: '#f3f4f6', backgroundColor: '#0f172a', minHeight: '100vh', overflowX: 'hidden' }}>
            <Helmet>
                <title>CoachFlow | High-Ticket Coaching Framework & Dashboard</title>
                <meta name="description" content="The ultimate operating system for high-ticket coaches. Automate lead tracking, visualize revenue, and manage framework clients in one secure, real-time dashboard." />
                <meta name="keywords" content="coachflow, coaching dashboard, high-ticket coaching, coaching frameworks, client management system, coach data visualization" />
                <link rel="canonical" href="https://coachflowos.vercel.app/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://coachflowos.vercel.app/" />
                <meta property="og:title" content="CoachFlow - The Operating System for High-Ticket Frameworks" />
                <meta property="og:description" content="Stop guessing. Start scaling. Used by top coaches to track millions in revenue." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://coachflowos.vercel.app/" />
                <meta property="twitter:title" content="CoachFlow - The Operating System for High-Ticket Frameworks" />
                <meta property="twitter:description" content="The detailed dashboard for high-ticket coaches. Track leads, revenue, and client progress." />
                <meta property="twitter:image" content="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" />

                {/* Structured Data (JSON-LD) */}
                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org",
                      "@type": "SoftwareApplication",
                      "name": "CoachFlow",
                      "applicationCategory": "BusinessApplication",
                      "operatingSystem": "Web",
                      "offers": {
                        "@type": "Offer",
                        "price": "49.00",
                        "priceCurrency": "USD",
                        "category": "Subscription"
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "ratingCount": "124"
                      },
                      "description": "The Operating System for High-Ticket Frameworks. Automate your leads, visualize revenue, and manage your pipeline in one beautiful, real-time dashboard."
                    }
                    `}
                </script>
            </Helmet>

            {/* Background Gradients */}
            <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', backgroundColor: '#6366f1', filter: 'blur(180px)', opacity: 0.1, zIndex: 0, borderRadius: '50%' }} />

            {/* Navbar */}
            <header style={{ position: 'relative', zIndex: 10, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                    <BarChart2 color="#818cf8" fill="#4f46e5" /> CoachFlow
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user?.email === 'haseebservises@gmail.com' && (
                        <button onClick={() => navigate('/admin')} style={{ color: '#9ca3af', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Admin</button>
                    )}
                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                        style={{ color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                    >
                        {user ? 'Dashboard' : 'Login'}
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{ position: 'relative', zIndex: 10, padding: '5rem 1rem 3rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Star size={16} fill="#818cf8" /> New: Automated Lead Tracking
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1, maxWidth: '900px', margin: '0 auto 1.5rem', color: '#ffffff' }}>
                    The Operating System for <br />
                    <span style={{ background: 'linear-gradient(to right, #818cf8, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        High-Ticket Frameworks
                    </span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Stop guessing. Start scaling. Automate your leads, visualize your revenue, and manage your pipeline in one beautiful, real-time dashboard.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <a href="#pricing" style={{ padding: '1rem 2.5rem', backgroundColor: '#4f46e5', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Start Membership <ArrowRight size={20} />
                    </a>
                </div>
            </section>

            {/* Dashboard Mockup (High Fidelity) */}
            <section style={{ position: 'relative', zIndex: 10, padding: '0 1rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    borderRadius: '20px',
                    padding: '0.5rem',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <img
                        src={dashboardMockup}
                        alt="CoachFlow Dashboard Preview"
                        style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'block' }}
                    />
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: '6rem 1rem', backgroundColor: '#0f172a' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Simple, Transparent Pricing</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Everything you need to grow your coaching business.</p>
                </div>

                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        borderRadius: '24px',
                        padding: '3rem',
                        position: 'relative',
                        boxShadow: '0 0 50px rgba(79, 70, 229, 0.2)'
                    }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#4f46e5', color: 'white', padding: '0.35rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                            MOST POPULAR
                        </div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>CoachFlow Pro</h3>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff', letterSpacing: '-1px' }}>
                            $49<span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500, letterSpacing: 'normal' }}>/month</span>
                        </div>
                        <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1rem' }}>For serious coaches ready to scale.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                            {[
                                'Real-time Analytics Dashboard',
                                'Unlimited Leads & Frameworks',
                                'Automatic Email Notifications',
                                'Priority 24/7 Support',
                                'Weekly Feature Updates'
                            ].map((feature, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#e2e8f0', fontSize: '1.05rem' }}>
                                    <CheckCircle size={20} color="#818cf8" /> {feature}
                                </div>
                            ))}
                        </div>

                        <a href="#join" style={{ display: 'block', textAlign: 'center', padding: '1.25rem', backgroundColor: '#4f46e5', color: 'white', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s, background 0.2s', fontSize: '1.1rem' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                            Get Started Now
                        </a>
                    </div>
                </div>
            </section>

            {/* Payment & Order Form */}
            <section id="join" style={{ position: 'relative', zIndex: 10, padding: '6rem 1rem', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)', gap: '5rem', alignItems: 'start' }}>

                {/* Instructions */}
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' }}>
                        Join the Inner Circle
                    </h2>
                    <p style={{ color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.7, fontSize: '1.1rem' }}>
                        To activate your membership, please transfer your first month's fee <strong>($49)</strong> to the account below. We will verify and send your login credentials instantly.
                    </p>

                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px' }}>
                                <Shield color="#f472b6" size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>Primary Bank (UBL)</h4>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Abdul Haseeb</div>
                            </div>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px dashed #64748b', textAlign: 'center', letterSpacing: '1px' }}>
                            PK82 UNIL 0109 0003 4011 1189
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                                <Zap color="#34d399" size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Secondary Options</h4>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '1rem', color: '#e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>SadaPay</span> <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>PK35 SADA 0000 0030 1781 4893</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span>NayaPay</span> <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>PK71 NAYA 1234 5030 1781 4893</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '3rem', borderRadius: '24px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', color: '#fff' }}>Submit Access Request</h3>

                    {message && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: message.type === 'error' ? '#fca5a5' : '#86efac',
                            border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            {message.type === 'success' && <CheckCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleOrder}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: '#e2e8f0', fontSize: '0.95rem' }}>Transaction ID / Invite Code</label>
                            <input
                                type="text"
                                required
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g. TX-12345 or VIP-INVITE"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', fontSize: '1rem' }}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star size={14} fill="#94a3b8" /> Existing clients: Enter your invite code or name to skip payment.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                fontWeight: 800,
                                borderRadius: '14px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 0 30px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            {loading ? 'Processing...' : 'Secure My Spot'}
                        </button>
                    </form>
                </div>
            </section>

            <footer style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p>&copy; {new Date().getFullYear()} CoachFlow. All rights reserved.</p>
            </footer>
        </div >
    );
};

export default LandingPage;
