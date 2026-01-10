import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    FileText,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Calendar,
    DollarSign,
    PieChart,
    ShoppingCart,
    RefreshCw,
    ShieldCheck,
    Copy,
    Check,
    Eye,
    EyeOff
} from 'lucide-react';

import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import BuyCreditsModal from '../components/BuyCreditsModal';

const Dashboard = () => {
    const [stats, setStats] = useState({
        credits: 0,
        totalInvoices: 0,
        ivaCollected: 0,
        totalVentas: 0,
        recentInvoices: []
    });
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);

        // Parallel but individual so they don't block each other
        const fetchCredits = async () => {
            try {
                const res = await apiClient.get('/api/credits');
                setStats(s => ({ ...s, credits: res.data.data?.balance ?? res.data.balance ?? (typeof res.data.data === 'number' ? res.data.data : 0) }));
            } catch (e) { console.error('Error credits:', e); }
        };

        const fetchInvoices = async () => {
            try {
                const res = await apiClient.get(`/api/facturas?limit=10&fecha_inicio=${dateRange.start}&fecha_fin=${dateRange.end}`);
                setStats(s => ({ ...s, totalInvoices: res.data.total || 0, recentInvoices: res.data.data || [] }));
            } catch (e) { console.error('Error invoices:', e); }
        };

        const fetchStats = async () => {
            try {
                const res = await apiClient.get(`/api/facturas/stats?fecha_inicio=${dateRange.start}&fecha_fin=${dateRange.end}`);
                setStats(s => ({ ...s, ivaCollected: res.data.data?.sum_iva || 0, totalVentas: res.data.data?.sum_total || 0 }));
            } catch (e) { console.error('Error stats:', e); }
        };

        const fetchEmitter = async () => {
            try {
                const res = await apiClient.get('/api/emitter');
                if (res.data.data?.api_key) {
                    setApiKey(res.data.data.api_key);
                } else {
                    setApiKey('ERROR_NO_KEY_FOUND');
                }
            } catch (e) {
                console.error('Error emitter:', e);
                setApiKey('ERROR_API_500');
            }
        };

        await Promise.allSettled([
            fetchCredits(),
            fetchInvoices(),
            fetchStats(),
            fetchEmitter()
        ]);

        setLoading(false);
    };


    return (
        <>
            <div className="mesh-gradient">
                <div className="mesh-blob mesh-1"></div>
                <div className="mesh-blob mesh-2"></div>
            </div>
            <div className="content-page animate-in">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Panel de Control</h1>
                        <p className="text-muted">Resumen operativo y métricas de facturación.</p>
                    </div>

                    <div className="flex items-center gap-3 glass p-2 rounded-2xl">
                        <div className="flex items-center gap-2 px-3">
                            <Calendar size={18} className="text-primary" />
                            <input
                                type="date"
                                className="bg-transparent border-none text-sm font-bold text-main focus:ring-0"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="text-dim"> hasta </div>
                        <div className="flex items-center gap-2 px-3">
                            <input
                                type="date"
                                className="bg-transparent border-none text-sm font-bold text-main focus:ring-0"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    {/* Credits Card */}
                    <div className="stat-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                            >
                                Comprar Créditos
                            </button>
                        </div>
                        <div className="stat-value">{stats.credits}</div>
                        <div className="text-sm font-bold text-muted uppercase tracking-wider">Créditos Disponibles</div>
                        {stats.credits <= 15 && (
                            <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-error text-xs">
                                <AlertCircle size={14} />
                                <span className="font-bold">Saldo crítico. Recarga necesaria.</span>
                            </div>
                        )}
                    </div>

                    {/* Sales Card */}
                    <div className="stat-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-success/10 text-success">
                                <DollarSign size={24} />
                            </div>
                            <div className="text-[10px] font-black uppercase text-success bg-success/10 px-3 py-1.5 rounded-full">
                                Ventas Autorizadas
                            </div>
                        </div>
                        <div className="stat-value">${stats.totalVentas.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <div className="text-sm font-bold text-muted uppercase tracking-wider">Monto Total Recaudado</div>
                    </div>

                    {/* IVA Card */}
                    <div className="stat-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-warning/10 text-warning">
                                <PieChart size={24} />
                            </div>
                            <div className="text-[10px] font-black uppercase text-warning bg-warning/10 px-3 py-1.5 rounded-full">
                                IVA Retenido
                            </div>
                        </div>
                        <div className="stat-value">${stats.ivaCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <div className="text-sm font-bold text-muted uppercase tracking-wider">Total Impuestos (15%)</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Facturas Recientes</h3>
                            <Link to="/history" className="btn-secondary py-2 px-4 text-sm">Ver todo</Link>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th className="text-right">Total</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentInvoices.length > 0 ? stats.recentInvoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td>
                                                <div className="font-bold">{new Date(inv.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-dim font-mono">{inv.clave_acceso.substring(0, 15)}...</div>
                                            </td>
                                            <td>
                                                <div className="font-bold text-main">{inv.razon_social_cliente || 'N/A'}</div>
                                                <div className="text-xs text-muted">{inv.identificacion_cliente}</div>
                                            </td>
                                            <td className="text-right font-black text-main">
                                                ${inv.importe_total.toFixed(2)}
                                            </td>
                                            <td>
                                                <span className={`badge ${inv.estado === 'AUTORIZADO' ? 'badge-success' : 'badge-error'}`}>
                                                    {inv.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-20 text-muted italic">
                                                No se encontraron comprobantes para este rango.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="glass p-8 rounded-3xl border-t-4 border-primary">
                            <div className="p-4 rounded-2xl bg-primary/5 mb-6 text-center">
                                <ShoppingCart size={40} className="text-primary mx-auto mb-4" />
                                <h4 className="text-lg font-black mb-1">Acceso Rápido</h4>
                                <p className="text-xs text-muted">Emite una nueva factura electrónica en segundos.</p>
                            </div>
                            <Link to="/new-invoice" className="btn-primary w-full shadow-lg">
                                <PlusCircle size={20} />
                                Nueva Factura
                            </Link>
                        </div>

                        {/* HIGH VISIBILITY API KEY CARD */}
                        <div className="glass p-8 rounded-3xl border-t-8 border-primary relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck size={80} />
                            </div>

                            <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} /> API Key de Integración
                            </h4>

                            <div className="relative mb-4">
                                <input
                                    type={showKey ? "text" : "password"}
                                    readOnly
                                    value={apiKey || 'Cargando...'}
                                    className={`w-full bg-main/5 border border-border rounded-xl px-4 py-3 text-xs font-mono pr-20 focus:outline-none ${apiKey.includes('ERROR') ? 'text-error' : ''}`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="p-1.5 text-muted hover:text-main transition-colors"
                                    >
                                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!apiKey) return;
                                            navigator.clipboard.writeText(apiKey);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="p-1.5 text-muted hover:text-primary transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-muted leading-relaxed">
                                Úsala como <span className="text-main font-bold">Bearer Token</span> en tus peticiones externas.
                                {copied && <span className="text-success font-bold block mt-1 animate-bounce">✓ ¡Copiado al portapapeles!</span>}
                            </p>
                        </div>


                        <div className="glass p-6 rounded-3xl border border-warning/10 bg-warning/5">
                            <div className="flex gap-4">
                                <AlertCircle size={24} className="text-warning shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-warning mb-1">Recordatorio de Firma</h4>
                                    <p className="text-[11px] text-muted leading-relaxed">
                                        Asegúrate de tener tu certificado .p12 actualizado en la sección de perfil para evitar rechazos del SRI.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BuyCreditsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Dashboard;
