import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Loader, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/update-password',
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Check your email for the password reset link!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
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
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)'
        }}>
            <form onSubmit={handleReset} className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}
                >
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Login
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Enter your email to receive a reset link.
                </p>

                {message && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        borderRadius: '4px',
                        backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: message.type === 'error' ? '#991b1b' : '#166534',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                borderRadius: 'var(--border-radius)',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {loading ? <Loader className="spin" size={20} /> : 'Send Reset Link'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
