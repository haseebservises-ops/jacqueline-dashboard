import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    // Ensure user is authenticated (via the email link token)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMessage({ type: 'error', text: 'Invalid or expired reset link. Please try again.' });
            }
        };
        checkSession();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' });
            setTimeout(() => navigate('/dashboard'), 2000);
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
            <form onSubmit={handleUpdate} className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Set New Password</h2>

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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            minLength={6}
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
                    disabled={loading || (message && message.type === 'error')}
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
                    {loading ? <Loader className="spin" size={20} /> : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default UpdatePassword;
