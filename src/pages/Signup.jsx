import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserPlus,
    Mail,
    Lock,
    Building2,
    Hash,
    ArrowRight,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        ruc: '',
        razon_social: '',
        nombre_comercial: '',
        direccion: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const { ok, error: signupError, mensaje } = await signup(formData);

        if (ok) {
            setSuccess(mensaje || 'Usuario registrado. Revisa tu correo.');
            setTimeout(() => navigate('/login'), 5000);
        } else {
            setError(signupError || 'Error al completar el registro.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen bg-bg-primary overflow-hidden">
            {/* Right Content Section */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-16 animate-in">
                <div className="w-full max-w-xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black mb-3">Únete a SRIFlow</h2>
                        <p className="text-muted font-medium text-lg">Comienza a facturar electrónicamente hoy mismo.</p>
                    </div>

                    {(error || success) && (
                        <div className={`mb-8 p-6 rounded-3xl border flex items-center gap-4 font-bold text-sm ${error ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'}`}>
                            {error ? <AlertCircle size={24} /> : <ShieldCheck size={24} />}
                            {error || success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="form-group">
                            <label className="form-label">RUC de la Empresa</label>
                            <div className="relative group">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input name="ruc" type="text" className="form-input pl-12" placeholder="Ej. 17..." required value={formData.ruc} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Razón Social</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input name="razon_social" type="text" className="form-input pl-12" placeholder="EMPRESA S.A." required value={formData.razon_social} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group md:col-span-2">
                            <label className="form-label">Correo Electrónico de acceso</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input name="email" type="email" className="form-input pl-12" placeholder="admin@empresa.com" required value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group md:col-span-2">
                            <label className="form-label">Dirección Matriz</label>
                            <input name="direccion" type="text" className="form-input" placeholder="Av. Principal, Quito, Ecuador" value={formData.direccion} onChange={handleChange} />
                        </div>

                        <div className="form-group md:col-span-2 mb-8">
                            <label className="form-label">Contraseña Segura</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                <input name="password" type="password" className="form-input pl-12" placeholder="Min. 8 caracteres" required value={formData.password} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg shadow-2xl">
                                {loading ? 'Creando cuenta...' : 'Confirmar Registro & Comenzar'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </div>

                        <div className="md:col-span-2 mt-8 pt-8 border-t border-border text-center">
                            <p className="text-sm font-medium text-muted">
                                ¿Ya tienes cuenta? {' '}
                                <Link to="/login" className="text-primary font-black hover:underline">Inicia sesión con tu RUC</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Side Promotion Panel */}
            <div className="hidden lg:flex lg:w-5/12 bg-bg-secondary p-20 flex-col justify-end border-l border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 right-10 w-80 h-80 bg-primary blur-[100px] rounded-full"></div>
                </div>

                <div className="relative z-10">
                    <div className="p-4 bg-success/10 rounded-2xl w-fit mb-8 border border-success/20">
                        <UserPlus size={32} className="text-success" />
                    </div>
                    <h3 className="text-4xl font-black mb-6 tracking-tight">Créditos Gratis.</h3>
                    <p className="text-lg text-muted leading-relaxed font-medium">
                        Al registrarte hoy obtienes <span className="text-success font-black">25 créditos iniciales</span> totalmente gratis para empezar a facturar de inmediato.
                    </p>

                    <div className="mt-20 glass p-6 rounded-3xl border-success/20 bg-success/5">
                        <div className="text-sm font-bold text-main mb-2">Paso Siguiente:</div>
                        <p className="text-xs text-muted leading-relaxed">
                            Una vez confirmes tu registro, se auto-generarán tu local 001 y caja 100 por defecto para que puedas probar el sistema sin esperas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
