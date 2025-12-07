import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            // Deep space background with subtle gradient
            background: 'radial-gradient(circle at top right, #1e1b4b 0%, #020617 100%)',
            color: '#f8fafc',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Helmet>
                <title>Login | CoachFlow</title>
                <meta name="description" content="Login to your CoachFlow dashboard." />
            </Helmet>

            {/* Background Orbs */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '400px',
                height: '400px',
                background: '#4f46e5',
                filter: 'blur(150px)',
                opacity: 0.2,
                borderRadius: '50%'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '20%',
                width: '300px',
                height: '300px',
                background: '#c026d3',
                filter: 'blur(150px)',
                opacity: 0.15,
                borderRadius: '50%'
            }}></div>

            <form onSubmit={handleSubmit} className="glass-card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '3rem 2.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15, 23, 42, 0.6)', // Glassy dark
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 10
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>Email Address</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem 0.85rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: '#fff',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#818cf8';
                                e.target.style.boxShadow = '0 0 0 2px rgba(129, 140, 248, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 500 }}>Password</label>
                        <span
                            onClick={() => navigate('/forgot-password')}
                            style={{
                                fontSize: '0.85rem',
                                color: '#818cf8',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#a5b4fc'}
                            onMouseLeave={(e) => e.target.style.color = '#818cf8'}
                        >
                            Forgot Password?
                        </span>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem 0.85rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: '#fff',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#818cf8';
                                e.target.style.boxShadow = '0 0 0 2px rgba(129, 140, 248, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.85rem',
                        // Gradient Button
                        background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {loading ? <Loader className="spin" size={20} /> : 'Sign In'}
                </button>
            </form >
        </div >
    );
};

export default Login;
