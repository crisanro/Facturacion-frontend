import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogIn,
    Mail,
    Lock,
    ArrowRight,
    AlertCircle,
    ShieldCheck,
    Building
} from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { ok, error: loginError } = await login(email, password);
        if (ok) {
            navigate('/dashboard');
        } else {
            setError(loginError || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen bg-bg-primary overflow-hidden relative">
            <div className="mesh-gradient">
                <div className="mesh-blob mesh-1"></div>
                <div className="mesh-blob mesh-2"></div>
                <div className="mesh-blob mesh-3"></div>
            </div>

            {/* Left Decoration Side */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-20">
                <div className="absolute inset-0 bg-bg-secondary/40 backdrop-blur-3xl border-r border-border"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="p-5 bg-primary/10 rounded-[2rem] w-fit mb-10 border border-primary/20 shadow-2xl shadow-primary/10">
                        <ShieldCheck size={56} className="text-primary" />
                    </div>
                    <h1 className="text-7xl font-black mb-8 tracking-tighter leading-[0.9] text-main">
                        Facturación<br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Digital Elite
                        </span>
                    </h1>
                    <p className="text-xl text-muted leading-relaxed font-medium">
                        Potencia tu negocio con la plataforma de emisión electrónica más avanzada del mercado. Rapidez, seguridad y control total.
                    </p>

                    <div className="mt-16 flex flex-col gap-8">
                        {[
                            { icon: Building, title: 'Multi-empresa', desc: 'Gestiona todas tus razones sociales.' },
                            { icon: LogIn, title: 'Acceso Instantáneo', desc: 'Sincronización en tiempo real con el SRI.' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 group">
                                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-primary border-primary/20 group-hover:scale-110 transition-transform">
                                    <item.icon size={28} />
                                </div>
                                <div className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <h4 className="font-black text-main text-lg">{item.title}</h4>
                                    <p className="text-sm text-dim">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Login Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
                <div className="w-full max-w-sm glass-premium p-10 rounded-[2.5rem] animate-in">
                    <div className="text-center mb-12">
                        <div className="lg:hidden p-4 glass rounded-2xl w-fit mx-auto mb-8 bg-primary/5 border-primary/20">
                            <ShieldCheck size={40} className="text-primary" />
                        </div>
                        <h2 className="text-4xl font-black mb-3 tracking-tight">Acceso</h2>
                        <p className="text-muted font-bold text-sm">Gestiona tus comprobantes fiscales</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-wide">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="form-group mb-4">
                            <label className="form-label">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    className="form-input pl-14 bg-bg-primary/50"
                                    placeholder="admin@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-6">
                            <div className="flex justify-between mb-2">
                                <label className="form-label mb-0">Contraseña Segura</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    className="form-input pl-14 bg-bg-primary/50"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-right mt-3">
                                <Link to="/reset-password" id="forgot-password" className="text-[10px] text-primary font-black uppercase tracking-widest hover:text-primary-hover transition-colors">¿Olvidaste tu clave?</Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-5 text-lg shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
                            disabled={loading}
                        >
                            <span className="font-black uppercase tracking-widest">{loading ? 'Validando...' : 'Entrar al Sistema'}</span>
                            {!loading && <ArrowRight size={20} />}
                        </button>

                        <div className="mt-12 pt-10 border-t border-border/50 text-center">
                            <p className="text-xs font-bold text-muted uppercase tracking-widest">
                                ¿Nuevo en la plataforma?
                            </p>
                            <Link to="/signup" className="block mt-4 text-primary font-black text-sm hover:scale-105 transition-transform">Crear Cuenta Empresarial</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

};

export default Login;
