import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    FileText,
    TrendingUp,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Dashboard = () => {
    const [stats, setStats] = useState({
        credits: 0,
        totalInvoices: 0,
        recentInvoices: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [creditsRes, invoicesRes] = await Promise.all([
                    apiClient.get('/api/credits'),
                    apiClient.get('/api/facturas?limit=5')
                ]);

                setStats({
                    credits: creditsRes.data.balance,
                    totalInvoices: invoicesRes.data.total || 0,
                    recentInvoices: invoicesRes.data.data || []
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Cargando dashboard...</div>;
    }

    return (
        <div className="dashboard-view">
            <div className="dashboard-header mb-8">
                <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
                <p className="text-muted">Gestiona tus facturas y créditos de un vistazo.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass border-l-4 border-primary">
                    <div className="stat-header">
                        <span>Saldo de Créditos</span>
                        <TrendingUp size={20} className="text-primary" />
                    </div>
                    <div className="stat-value">{stats.credits}</div>
                    <div className="stat-label">Disponibles para facturar</div>
                    {stats.credits <= 15 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                            <AlertCircle size={14} />
                            <span>Saldo bajo. Recarga pronto.</span>
                        </div>
                    )}
                </div>

                <div className="stat-card glass">
                    <div className="stat-header">
                        <span>Total Facturas</span>
                        <FileText size={20} className="text-purple-400" />
                    </div>
                    <div className="stat-value">{stats.totalInvoices}</div>
                    <div className="stat-label">Emitidas este mes</div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-header">
                        <span>Acceso Rápido</span>
                        <PlusCircle size={20} className="text-success" />
                    </div>
                    <Link to="/new-invoice" className="btn-primary flex items-center justify-center gap-2 mt-2">
                        Nueva Factura
                    </Link>
                </div>
            </div>

            <div className="recent-section mt-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Facturas Recientes</h3>
                    <Link to="/history" className="text-primary text-sm flex items-center gap-1 hover:underline">
                        Ver todas <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="glass rounded-xl overflow-hidden">
                    {stats.recentInvoices.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">RUC/Cédula</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.recentInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{inv.razon_social_cliente || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted">{inv.identificacion_cliente}</td>
                                        <td className="px-6 py-4 text-right font-bold">${inv.importe_total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.estado === 'AUTORIZADO' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                                {inv.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-muted">
                            No hay facturas recientes.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
