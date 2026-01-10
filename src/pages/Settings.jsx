import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    RefreshCw,
    Copy,
    Check,
    Eye,
    EyeOff,
    Server,
    Code
} from 'lucide-react';
import apiClient from '../api/apiClient';

const Settings = () => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        const fetchKey = async () => {
            setFetching(true);
            try {
                const res = await apiClient.get('/api/emitter');
                if (res.data.data?.api_key) {
                    setApiKey(res.data.data.api_key);
                }
            } catch (err) {
                console.error('Error fetching key:', err);
            } finally {
                setFetching(false);
            }
        };
        fetchKey();
    }, []);


    const handleRegenerate = async () => {
        const confirmed = window.confirm(
            '¿ESTÁ SEGURO DE REGENERAR SU TOKEN DE AUTORIZACIÓN? \n\n' +
            'Esto invalidará inmediatamente el token actual. Si tiene sistemas integrados activos, dejarán de funcionar hasta que actualice la llave.'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await apiClient.post('/api/auth/regenerate-key');
            setApiKey(response.data.key);
            setShowKey(true);
        } catch (error) {
            alert('Error al regenerar token');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!apiKey) {
            alert('No hay llave para copiar. Regenera una si es necesario.');
            return;
        }
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    return (
        <div className="content-page animate-in">
            <div className="mb-12">
                <h1 className="text-3xl font-black mb-2">Configuración Avanzada</h1>
                <p className="text-muted">Gestiona el acceso técnico y la integración con sistemas externos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* API Key Management */}
                <div className="glass p-10 rounded-3xl border-t-8 border-error">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-error/10 text-error rounded-2xl">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Token de Autorización</h2>
                            <p className="text-xs text-muted">Clave secreta para peticiones API.</p>
                        </div>
                    </div>

                    <div className="bg-error/5 border border-error/10 p-5 rounded-2xl mb-8">
                        <p className="text-xs text-error font-medium leading-relaxed">
                            <strong>ADVERTENCIA:</strong> Esta llave permite emitir documentos legales en su nombre.
                            No la comparta, no la guarde en repositorios públicos y no la exponga en el frontend de aplicaciones externas.
                        </p>
                    </div>

                    <div className="form-group mb-8">
                        <label className="form-label">API Key Actual</label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                className="form-input font-mono text-sm pr-20"
                                readOnly
                                value={apiKey || '••••••••••••••••••••••••••••••••••••••••••••••••'}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-2 text-muted hover:text-main"
                                >
                                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 text-muted hover:text-primary"
                                >
                                    {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="btn-primary w-full bg-error hover:bg-error/80 shadow-error/20"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw size={20} />}
                        {loading ? 'Procesando...' : 'Regenerar Credenciales'}
                    </button>
                </div>

                {/* Integration Details */}
                <div className="flex flex-col gap-8">
                    <div className="glass p-10 rounded-3xl border-t-8 border-primary">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Code size={24} className="text-primary" /> Documentación de Integración
                        </h2>
                        <p className="text-sm text-muted mb-8">
                            Para integrar SRIFlow con su ERP o sistema propio, debe incluir la API Key en las cabeceras de sus peticiones HTTP.
                        </p>

                        <div className="bg-bg-secondary p-5 rounded-2xl border border-border font-mono text-xs text-primary mb-8 overflow-x-auto">
                            <div>GET /api/credits</div>
                            <div className="text-muted mt-2">Authorization: Bearer <span className="text-success">SU_REGEN_KEY</span></div>
                        </div>

                        <a
                            href={`${import.meta.env.VITE_API_URL}/api-docs`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary w-full text-center flex justify-center gap-2"
                        >
                            Ver Swagger UI <Server size={18} />
                        </a>
                    </div>

                    <div className="glass p-8 rounded-3xl border border-border flex items-start gap-4">
                        <div className="p-3 bg-glass rounded-2xl text-main">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold mb-1">Rotación de Seguridad</h4>
                            <p className="text-xs text-muted leading-relaxed">
                                Como buena práctica, recomendamos rotar sus llaves API cada 90 días o inmediatamente si sospecha de una filtración.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
