import React, { useState, useEffect } from 'react';
import {
    Building2,
    Key,
    Upload,
    Trash2,
    Save,
    CreditCard,
    CheckCircle,
    AlertTriangle,
    MapPin,
    Terminal,
    Plus,
    ShieldCheck,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';

import apiClient from '../api/apiClient';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [emitter, setEmitter] = useState({});
    const [establishments, setEstablishments] = useState([]);
    const [points, setPoints] = useState([]);
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);


    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    // CRUD states
    const [showEstForm, setShowEstForm] = useState(false);
    const [newEst, setNewEst] = useState({ codigo: '', nombre_comercial: '', direccion: '' });

    const [showPointForm, setShowPointForm] = useState(false);
    const [newPoint, setNewPoint] = useState({ codigo: '', nombre: '', establecimiento_id: '' });


    // Form states
    const [p12File, setP12File] = useState(null);
    const [p12Password, setP12Password] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [emRes, estRes, ptsRes] = await Promise.all([
                apiClient.get('/api/emitter'),
                apiClient.get('/api/establishments'),
                apiClient.get('/api/puntos-emision')
            ]);
            setEmitter(emRes.data.data);
            setApiKey(emRes.data.data.api_key || '');
            setEstablishments(estRes.data.data);
            setPoints(ptsRes.data.data);

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmitter = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.patch('/api/config/auto-reload', emitter);
            setMessage('Perfil actualizado con éxito');

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadCertificate = async () => {
        if (!p12File || !p12Password) {
            alert('Por favor selecciona un archivo y escribe la contraseña');
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('file', p12File);
        formData.append('password', p12Password);

        try {
            await apiClient.post('/api/p12/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Firma electrónica subida con éxito');
            setP12File(null);
            setP12Password('');
            fetchAllData();
        } catch (error) {
            console.error('Error uploading certificate:', error);
            alert(error.response?.data?.error || 'Error al subir la firma');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCertificate = async () => {
        if (!window.confirm('¿Estás seguro de eliminar tu firma electrónica? No podrás emitir facturas.')) return;

        setSaving(true);
        try {
            await apiClient.delete('/api/emitter/certificate');
            setMessage('Firma electrónica eliminada');
            fetchAllData();
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Error al eliminar la firma');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerateKey = async () => {

        if (!window.confirm('ADVERTENCIA: Regenerar la API Key invalidará la anterior. ¿Deseas continuar?')) return;
        try {
            const res = await apiClient.post('/api/auth/regenerate-key');
            setApiKey(res.data.key);
            alert('Nueva API Key generada con éxito. Asegúrate de guardarla en un lugar seguro.');
        } catch (error) {
            alert('Error al regenerar llave');
        }
    };

    // --- ESTABLISHMENTS CRUD ---
    const handleAddEstablishment = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/api/establishments', newEst);
            setNewEst({ codigo: '', nombre_comercial: '', direccion: '' });
            setShowEstForm(false);
            setMessage('Establecimiento creado');
            fetchAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear establecimiento');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEstablishment = async (id) => {
        if (!window.confirm('¿Eliminar establecimiento? Se podrían perder asociaciones.')) return;
        try {
            await apiClient.delete(`/api/establishments/${id}`);
            setMessage('Establecimiento eliminado');
            fetchAllData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    // --- POINTS CRUD ---
    const handleAddPoint = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.post('/api/puntos-emision', newPoint);
            setNewPoint({ codigo: '', nombre: '', establecimiento_id: '' });
            setShowPointForm(false);
            setMessage('Punto de emisión creado');
            fetchAllData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear punto');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePoint = async (id) => {
        if (!window.confirm('¿Eliminar punto de emisión?')) return;
        try {
            await apiClient.delete(`/api/puntos-emision/${id}`);
            setMessage('Punto eliminado');
            fetchAllData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };


    if (loading) return <div className="p-20 text-center text-muted font-bold animate-pulse">Cargando configuración...</div>;

    return (
        <div className="content-page animate-in">
            <div className="mb-12">
                <h1 className="text-3xl font-black mb-2">Mi Perfil & Organización</h1>
                <p className="text-muted">Gestiona la identidad de tu empresa, firma electrónica y puntos de venta.</p>
            </div>

            {message && (
                <div className="mb-8 p-4 bg-success/15 border border-success/20 text-success rounded-2xl font-bold flex items-center gap-3">
                    <CheckCircle size={20} /> {message}
                </div>
            )}

            {/* Tabs System */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
                {[
                    { id: 'company', label: 'Datos Empresa', icon: Building2 },
                    { id: 'security', label: 'Firma & API', icon: ShieldCheck },
                    { id: 'structure', label: 'Establecimientos', icon: MapPin },
                    { id: 'billing', label: 'Auto-Recarga', icon: RefreshCw },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-glass text-muted hover:text-main'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">

                {/* Tab Content: Company Info */}
                {activeTab === 'company' && (
                    <div className="glass p-10 rounded-3xl max-w-4xl border-l-4 border-primary">
                        <h2 className="text-xl font-bold mb-8">Información de la Razón Social</h2>
                        <form onSubmit={handleUpdateEmitter} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <div className="form-group">
                                <label className="form-label">RUC (No modificable)</label>
                                <input type="text" className="form-input opacity-50 cursor-not-allowed" value={emitter.ruc} readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Razón Social</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={emitter.razon_social}
                                    onChange={e => setEmitter({ ...emitter, razon_social: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label className="form-label">Dirección Matriz</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={emitter.direccion_matriz || ''}
                                    onChange={e => setEmitter({ ...emitter, direccion_matriz: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email de Notificación</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={emitter.email_contacto || ''}
                                    onChange={e => setEmitter({ ...emitter, email_contacto: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end mb-8">
                                <button type="submit" disabled={saving} className="btn-primary w-full">
                                    <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Información'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab Content: Security (P12 & API) */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* P12 Upload Redesign */}
                        <div className="glass p-10 rounded-3xl border-t-4 border-warning">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Key size={24} className="text-warning" /> Firma Electrónica (.p12)
                            </h2>

                            {emitter.p12_path ? (
                                <div className="bg-success/5 border border-success/10 p-5 rounded-2xl mb-8 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-success/20 rounded-full text-success"><CheckCircle size={20} /></div>
                                        <div>
                                            <div className="font-bold text-success text-sm">Certificado Cargado</div>
                                            <div className="text-[10px] text-muted">Válido para firmar facturas</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeleteCertificate}
                                        className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>
                            ) : (
                                <div className="bg-warning/5 border border-warning/10 p-5 rounded-2xl mb-8 flex items-center gap-4">
                                    <AlertTriangle size={24} className="text-warning" />
                                    <div className="text-xs text-warning font-medium">No has subido tu firma. La emisión de facturas fallará.</div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Seleccionar Archivo</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={e => setP12File(e.target.files[0])}
                                    />
                                    <div className="glass border-dashed border-2 p-8 text-center rounded-2xl group-hover:border-primary transition-all">
                                        <Upload size={32} className="text-dim mx-auto mb-2" />
                                        <div className="text-sm font-bold text-muted">{p12File ? p12File.name : 'Arrastra tu .p12 aquí'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contraseña de Firma</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="******"
                                    value={p12Password}
                                    onChange={e => setP12Password(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleUploadCertificate}
                                disabled={saving}
                                className="btn-primary w-full bg-warning hover:bg-warning/80 border-none shadow-warning/20"
                            >
                                {saving ? 'Procesando...' : 'Validar y Subir Certificado'}
                            </button>

                        </div>

                        {/* API Key Management */}
                        <div className="glass p-10 rounded-3xl border-t-4 border-primary">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShieldCheck size={24} className="text-primary" /> API Key Personal
                            </h2>
                            <p className="text-xs text-muted leading-relaxed mb-8">
                                Usa esta llave para integrar tu sistema externo con nuestra API de forma segura.
                                <span className="text-error font-bold"> No la compartas con nadie.</span>
                            </p>

                            <div className="form-group">
                                <label className="form-label">Tu Clave de Acceso API</label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        className="form-input font-mono text-sm pr-12"
                                        readOnly
                                        value={apiKey || '••••••••••••••••••••••••••••'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 p-2 text-dim hover:text-primary transition-colors"
                                    >
                                        {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 gap-4">
                                <button onClick={handleRegenerateKey} className="btn-secondary flex justify-center gap-2">
                                    <RefreshCw size={18} /> Regenerar API Key
                                </button>
                                <p className="text-[10px] text-error font-medium italic">
                                    * Al regenerar, la llave anterior dejará de funcionar inmediatamente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Structure ( CRUD ) */}
                {activeTab === 'structure' && (
                    <div className="flex flex-col gap-12">
                        <div className="glass p-10 rounded-3xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <MapPin size={24} className="text-primary" /> Locales & Establecimientos
                                </h2>
                                <button
                                    onClick={() => setShowEstForm(!showEstForm)}
                                    className="btn-primary py-2 px-6 text-sm"
                                >
                                    <Plus size={18} /> {showEstForm ? 'Cerrar' : 'Nuevo Local'}
                                </button>
                            </div>

                            {showEstForm && (
                                <form onSubmit={handleAddEstablishment} className="mb-10 p-6 bg-primary/5 border border-primary/10 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-in">
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Cód (ej. 001)</label>
                                        <input type="text" className="form-input py-2 text-sm" placeholder="001" required
                                            value={newEst.codigo} onChange={e => setNewEst({ ...newEst, codigo: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Nombre Comercial</label>
                                        <input type="text" className="form-input py-2 text-sm" placeholder="Sucursal Norte" required
                                            value={newEst.nombre_comercial} onChange={e => setNewEst({ ...newEst, nombre_comercial: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Dirección</label>
                                        <input type="text" className="form-input py-2 text-sm" placeholder="Av... Quito" required
                                            value={newEst.direccion} onChange={e => setNewEst({ ...newEst, direccion: e.target.value })} />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" disabled={saving} className="btn-primary w-full py-2">
                                            {saving ? '...' : 'Crear'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr><th>Cód</th><th>Nombre Comercial</th><th>Dirección</th><th className="text-right">Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {establishments.map(est => (
                                            <tr key={est.id}>
                                                <td className="font-black text-primary">{est.codigo}</td>
                                                <td className="font-bold">{est.nombre_comercial}</td>
                                                <td className="text-muted text-xs">{est.direccion}</td>
                                                <td className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDeleteEstablishment(est.id)}
                                                            className="text-dim hover:text-error p-2 rounded-lg hover:bg-error/10 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass p-10 rounded-3xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <Terminal size={24} className="text-secondary" /> Puntos de Emisión
                                </h2>
                                <button
                                    onClick={() => setShowPointForm(!showPointForm)}
                                    className="btn-primary py-2 px-6 text-sm bg-secondary hover:bg-secondary/80"
                                >
                                    <Plus size={18} /> {showPointForm ? 'Cerrar' : 'Nueva Caja'}
                                </button>
                            </div>

                            {showPointForm && (
                                <form onSubmit={handleAddPoint} className="mb-10 p-6 bg-secondary/5 border border-secondary/10 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-in">
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Local</label>
                                        <select className="form-input py-2 text-sm" required
                                            value={newPoint.establecimiento_id} onChange={e => setNewPoint({ ...newPoint, establecimiento_id: e.target.value })}>
                                            <option value="">Seleccione...</option>
                                            {establishments.map(e => <option key={e.id} value={e.id}>Local {e.codigo}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Cód (ej. 100)</label>
                                        <input type="text" className="form-input py-2 text-sm" placeholder="100" required
                                            value={newPoint.codigo} onChange={e => setNewPoint({ ...newPoint, codigo: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="text-[10px] font-black uppercase text-dim mb-1 block">Nombre Caja</label>
                                        <input type="text" className="form-input py-2 text-sm" placeholder="Caja Principal" required
                                            value={newPoint.nombre} onChange={e => setNewPoint({ ...newPoint, nombre: e.target.value })} />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" disabled={saving} className="btn-primary w-full py-2 bg-secondary border-none">
                                            {saving ? '...' : 'Crear'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr><th>Cód</th><th>Nombre</th><th>Local</th><th className="text-right">Secuencial</th><th className="text-right">Acciones</th></tr>
                                    </thead>
                                    <tbody>
                                        {points.map(pt => (
                                            <tr key={pt.id}>
                                                <td className="font-black text-secondary">{pt.codigo}</td>
                                                <td className="font-bold">{pt.nombre}</td>
                                                <td><span className="badge badge-success bg-glass border border-border">{pt.establecimiento?.codigo}</span></td>
                                                <td className="text-right font-mono font-bold">{pt.secuencial_actual}</td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => handleDeletePoint(pt.id)}
                                                        className="text-dim hover:text-error p-2 rounded-lg hover:bg-error/10 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}


                {/* Tab Content: Auto-Reload Billing */}
                {activeTab === 'billing' && (
                    <div className="glass p-10 rounded-3xl max-w-2xl border-l-4 border-success animate-in">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <RefreshCw size={24} className="text-success" /> Configuración de Auto-Recarga
                        </h2>
                        <p className="text-sm text-muted mb-8 leading-relaxed">
                            Mantén tu flujo de facturación ininterrumpido. Cuando tus créditos bajen de cierto umbral, el sistema puede recargar automáticamente usando tu medio de pago guardado.
                        </p>

                        <div className="flex items-center gap-4 mb-10 p-6 glass bg-success/5 rounded-2xl border border-success/10">
                            <div className="flex-1">
                                <h4 className="font-bold text-main">Estado del Servicio</h4>
                                <p className="text-[10px] text-muted">¿Habilitar recargas automáticas?</p>
                            </div>
                            <div
                                onClick={() => setEmitter({ ...emitter, auto_reload_enabled: !emitter.auto_reload_enabled })}
                                className={`w-14 h-8 rounded-full cursor-pointer transition-all p-1 flex items-center ${emitter.auto_reload_enabled ? 'bg-success justify-end' : 'bg-glass justify-start'}`}
                            >
                                <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                            </div>
                        </div>

                        {emitter.auto_reload_enabled && (
                            <div className="animate-in">
                                <div className="form-group">
                                    <label className="form-label">Recargar cuando el saldo sea menor a:</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={emitter.auto_reload_threshold || 10}
                                            onChange={e => setEmitter({ ...emitter, auto_reload_threshold: parseInt(e.target.value) })}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold">Créditos</div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Plan a recargar automáticamente:</label>
                                    <select className="form-input">
                                        <option value="basic">Plan Básico (100 Créditos - $15.00)</option>
                                        <option value="pro">Plan Pro (500 Créditos - $60.00)</option>
                                    </select>
                                </div>

                                <div className="p-6 glass bg-primary/5 rounded-2xl border border-primary/20 flex items-start gap-4 mb-8">
                                    <ShieldCheck size={20} className="text-primary mt-1" />
                                    <p className="text-[11px] text-muted leading-relaxed">
                                        Las transacciones se procesan de forma segura a través de Stripe. Asegúrese de tener un método de pago válido configurado en el Portal de Cliente.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button onClick={handleUpdateEmitter} className="btn-primary w-full shadow-lg">
                            <CheckCircle size={18} /> Guardar Configuración de Recarga
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Profile;
