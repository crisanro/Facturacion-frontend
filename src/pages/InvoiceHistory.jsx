import React, { useState, useEffect } from 'react';
import {
    Search,
    FileDown,
    Trash2,
    Eye,
    FileCode,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import apiClient from '../api/apiClient';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchInvoices();
    }, [offset]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/facturas?limit=${limit}&offset=${offset}`);
            if (response.data.ok) {
                setInvoices(response.data.data);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (claveAcceso) => {
        if (!window.confirm('¿Estás seguro de eliminar esta factura del sistema?')) return;
        try {
            await apiClient.delete(`/api/facturas/${claveAcceso}`);
            fetchInvoices();
        } catch (error) {
            alert('Error al eliminar factura');
        }
    };

    const getRideUrl = async (claveAcceso) => {
        try {
            const response = await apiClient.get(`/api/facturas/${claveAcceso}/ride`);
            if (response.data.ok && response.data.data.xmlUrl) {
                window.open(response.data.data.xmlUrl, '_blank');
            }
        } catch (error) {
            alert('Error al obtener URL del XML');
        }
    };

    if (loading && invoices.length === 0) return <div className="p-10 text-center">Cargando historial...</div>;

    return (
        <div className="history-page">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Historial de Facturación</h1>
                    <p className="text-muted">Consulta y descarga tus comprobantes emitidos.</p>
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Fecha</th>
                                <th className="px-6 py-4 font-semibold">Cód. Acceso / Secuencial</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold text-right">Total</th>
                                <th className="px-6 py-4 font-semibold">Estado</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.length > 0 ? invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                        <div className="text-[10px] text-muted">{new Date(inv.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-[10px] text-primary mb-1">{inv.clave_acceso}</div>
                                        <div className="text-xs font-bold">{inv.secuencial || 'S/N'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{inv.razon_social_cliente || 'N/A'}</div>
                                        <div className="text-[10px] text-muted">{inv.identificacion_cliente}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-white">
                                        ${inv.importe_total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.estado === 'AUTORIZADO' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                            {inv.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <a
                                                href={`https://minio_url_placeholder/${inv.clave_acceso}.pdf`} // This should ideally come from the API
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Ver PDF (RIDE)"
                                            >
                                                <FileDown size={18} />
                                            </a>
                                            <button
                                                onClick={() => getRideUrl(inv.clave_acceso)}
                                                className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Ver XML"
                                            >
                                                <FileCode size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inv.clave_acceso)}
                                                className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-muted">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={40} className="text-white/10" />
                                            <span>No se encontraron facturas emitidas.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-white/5">
                    <div className="text-sm text-muted">
                        Mostrando <span className="text-white font-medium">{Math.min(offset + 1, total)}</span> a <span className="text-white font-medium">{Math.min(offset + limit, total)}</span> de <span className="text-white font-medium">{total}</span> facturas
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={offset === 0}
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                            className="p-2 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={offset + limit >= total}
                            onClick={() => setOffset(offset + limit)}
                            className="p-2 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceHistory;
