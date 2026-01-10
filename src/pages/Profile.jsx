import React, { useState, useEffect } from 'react';
import {
    Building2,
    Key,
    Upload,
    Trash2,
    Save,
    CreditCard,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import apiClient from '../api/apiClient';

const Profile = () => {
    const [emitter, setEmitter] = useState({
        razon_social: '',
        ruc: '',
        direccion_matriz: '',
        p12_path: null,
        auto_reload_enabled: false,
        email_contacto: '',
        stripe_customer_id: ''
    });
    const [p12File, setP12File] = useState(null);
    const [p12Password, setP12Password] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchEmitterData();
    }, []);

    const fetchEmitterData = async () => {
        try {
            const response = await apiClient.get('/api/emitter');
            if (response.data.ok) {
                setEmitter(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching emitter data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await apiClient.patch('/api/emitter', {
                razon_social: emitter.razon_social,
                direccion_matriz: emitter.direccion_matriz
            });
            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar perfil' });
        } finally {
            setSaving(false);
        }
    };

    const handleUploadP12 = async (e) => {
        e.preventDefault();
        if (!p12File || !p12Password) {
            setMessage({ type: 'error', text: 'Selecciona un archivo y proporciona la contraseña' });
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('file', p12File);
        formData.append('password', p12Password);

        try {
            const response = await apiClient.post('/api/p12/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Firma electrónica cargada con éxito' });
                setP12File(null);
                setP12Password('');
                fetchEmitterData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.mensaje || 'Error al cargar firma' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteP12 = async () => {
        if (!window.confirm('¿Estás seguro de eliminar tu firma electrónica?')) return;

        setSaving(true);
        try {
            const response = await apiClient.delete('/api/p12');
            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Firma electrónica eliminada' });
                fetchEmitterData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar firma' });
        } finally {
            setSaving(false);
        }
    };

    const handleConfigAutoReload = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await apiClient.patch('/api/config/auto-reload', {
                auto_reload_enabled: emitter.auto_reload_enabled,
                email_contacto: emitter.email_contacto,
                stripe_customer_id: emitter.stripe_customer_id
            });
            if (response.data.ok) {
                setMessage({ type: 'success', text: 'Configuración de recarga actualizada' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar configuración' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando configuración...</div>;

    return (
        <div className="profile-page">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Configuración del Emisor</h1>
                <p className="text-muted">Gestiona los detalles de tu empresa y firma electrónica.</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'bg-success/20 text-success border-success/20' : 'alert-error'} border mb-6`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: Company Profile */}
                <div className="glass p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="text-primary" />
                        <h2 className="text-xl font-bold">Perfil de la Empresa</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label className="form-label">RUC</label>
                            <input type="text" className="form-input opacity-70" value={emitter.ruc} readOnly />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Razón Social</label>
                            <input
                                type="text"
                                className="form-input"
                                value={emitter.razon_social}
                                onChange={(e) => setEmitter({ ...emitter, razon_social: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dirección Matriz</label>
                            <input
                                type="text"
                                className="form-input"
                                value={emitter.direccion_matriz || ''}
                                onChange={(e) => setEmitter({ ...emitter, direccion_matriz: e.target.value })}
                                placeholder="Ej. Av. Amazonas N123"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Save size={18} className="inline mr-2" /> Guardar Cambios
                        </button>
                    </form>
                </div>

                {/* Section 2: Electronic Signature */}
                <div className="glass p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Key className="text-primary" />
                        <h2 className="text-xl font-bold">Firma Electrónica (.p12)</h2>
                    </div>

                    {emitter.p12_path ? (
                        <div className="bg-success/10 border border-success/20 p-4 rounded-lg mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-success" />
                                <div>
                                    <div className="text-success font-bold">Certificado Configurado</div>
                                    <div className="text-xs text-muted">Tu firma está lista para usar</div>
                                </div>
                            </div>
                            <button onClick={handleDeleteP12} className="text-error hover:bg-error/10 p-2 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg mb-6 flex items-center gap-3">
                            <AlertTriangle className="text-orange-500" />
                            <div className="text-orange-500">Sin firma configurada. No podrás emitir facturas.</div>
                        </div>
                    )}

                    <form onSubmit={handleUploadP12}>
                        <div className="form-group">
                            <label className="form-label">Archivo de Firma (.p12)</label>
                            <input
                                type="file"
                                accept=".p12"
                                className="form-input py-2"
                                onChange={(e) => setP12File(e.target.files[0])}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contraseña de Firma</label>
                            <input
                                type="password"
                                className="form-input"
                                value={p12Password}
                                onChange={(e) => setP12Password(e.target.value)}
                                placeholder="********"
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Upload size={18} className="inline mr-2" /> Subir Certificado
                        </button>
                    </form>
                </div>

                {/* Section 3: Auto-Reload */}
                <div className="glass p-6 rounded-xl lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="text-primary" />
                        <h2 className="text-xl font-bold">Recarga Automática y Créditos</h2>
                    </div>
                    <p className="text-muted mb-6">Las recargas automáticas se disparan cuando tu saldo llega a 15 créditos.</p>

                    <form onSubmit={handleConfigAutoReload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emitter.auto_reload_enabled}
                                    onChange={(e) => setEmitter({ ...emitter, auto_reload_enabled: e.target.checked })}
                                    className="w-5 h-5 accent-primary"
                                />
                                <span className="font-medium text-white">Activar Recarga Automática</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email de Notificación</label>
                            <input
                                type="email"
                                className="form-input"
                                value={emitter.email_contacto || ''}
                                onChange={(e) => setEmitter({ ...emitter, email_contacto: e.target.value })}
                                placeholder="notificaciones@tuempresa.com"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stripe Customer ID</label>
                            <input
                                type="text"
                                className="form-input"
                                value={emitter.stripe_customer_id || ''}
                                onChange={(e) => setEmitter({ ...emitter, stripe_customer_id: e.target.value })}
                                placeholder="cus_..."
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                Actualizar Configuración
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
