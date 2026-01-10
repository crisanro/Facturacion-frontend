import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        ruc: '',
        razon_social: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        const result = await signup(formData);

        if (result.success) {
            setSuccessMsg('Registro exitoso. Redirigiendo al inicio de sesión...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1 className="auth-title">Crea tu Cuenta</h1>
                    <p className="auth-subtitle">Empieza a facturar electrónicamente hoy</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {successMsg && <div className="alert" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="ejemplo@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">RUC (13 dígitos)</label>
                        <input
                            type="text"
                            name="ruc"
                            className="form-input"
                            placeholder="1712345678001"
                            maxLength="13"
                            value={formData.ruc}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Razón Social</label>
                        <input
                            type="text"
                            name="razon_social"
                            className="form-input"
                            placeholder="Mi Empresa S.A."
                            value={formData.razon_social}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="auth-footer">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="auth-link">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
