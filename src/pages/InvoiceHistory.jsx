import React, { useState, useEffect } from 'react';
import {
    Search,
    FileDown,
    Trash2,
    FileCode,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye
} from 'lucide-react';
import apiClient from '../api/apiClient';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const limit = 10;

    useEffect(() => {
        fetchInvoices();
    }, [offset, dateRange]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/facturas?limit=${limit}&offset=${offset}&fecha_inicio=${dateRange.start}&fecha_fin=${dateRange.end}`);
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

    const handleDownloadRide = async (claveAcceso) => {
        try {
            const response = await apiClient.get(`/api/facturas/${claveAcceso}/ride`);
            if (response.data.ok && response.data.pdfUrl) {
                window.open(response.data.pdfUrl, '_blank');
            } else {
                alert('No se pudo obtener el enlace del PDF (RIDE)');
            }
        } catch (error) {
            console.error('Error downloading RIDE:', error);
            alert('Error al intentar descargar el RIDE');
        }
    };

    return (

        <div className="content-page animate-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black mb-2">Historial Completo</h1>
                    <p className="text-muted">Busca y descarga tus comprobantes del SRI.</p>
                </div>

                <div className="flex items-center gap-3 glass p-2 rounded-2xl">
                    <div className="flex items-center gap-2 px-3 border-r border-border">
                        <Calendar size={18} className="text-primary" />
                        <input type="date" className="bg-transparent border-none text-xs font-bold text-main"
                            value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <input type="date" className="bg-transparent border-none text-xs font-bold text-main"
                            value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                    </div>
                </div>
            </div>

            <div className="table-container mb-8">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha emisión</th>
                            <th>Receptor / RUC</th>
                            <th>Secuencial</th>
                            <th className="text-right">Monto Total</th>
                            <th>Estado</th>
                            <th className="text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? invoices.map((inv) => (
                            <tr key={inv.id}>
                                <td className="font-medium">
                                    {new Date(inv.created_at).toLocaleDateString()}
                                    <div className="text-[10px] text-muted">{new Date(inv.created_at).toLocaleTimeString()}</div>
                                </td>
                                <td>
                                    <div className="font-black text-main">{inv.razon_social_cliente || 'SIN NOMBRE'}</div>
                                    <div className="text-xs text-muted font-mono">{inv.identificacion_cliente}</div>
                                </td>
                                <td className="font-mono text-[10px] tracking-tight">{inv.secuencial || 'Procesando...'}</td>
                                <td className="text-right font-black text-main text-lg">${inv.importe_total.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${inv.estado === 'AUTORIZADO' ? 'badge-success' : 'badge-error'}`}>
                                        {inv.estado}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleDownloadRide(inv.clave_acceso)}
                                            className="p-2.5 bg-glass text-primary rounded-xl hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                            title="Descargar RIDE (PDF)"
                                        >
                                            <Download size={18} />
                                        </button>

                                        <button className="p-2.5 bg-glass text-secondary rounded-xl hover:bg-secondary/10 transition-all border border-transparent hover:border-secondary/20"><FileCode size={18} /></button>
                                        <button className="p-2.5 bg-glass text-error rounded-xl hover:bg-error/10 transition-all border border-transparent hover:border-error/20"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="py-20 text-center text-muted font-bold italic">No hay registros para este período.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Redesign */}
            <div className="flex justify-between items-center glass p-6 rounded-3xl">
                <div className="text-sm font-bold text-muted">
                    Página {Math.floor(offset / limit) + 1} de {Math.ceil(total / limit) || 1}
                </div>
                <div className="flex gap-4">
                    <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}
                        className="btn-secondary py-2 flex items-center gap-2 group disabled:opacity-30">
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Anterior
                    </button>
                    <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}
                        className="btn-primary py-2 px-8 flex items-center gap-2 group disabled:opacity-30">
                        Siguiente <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceHistory;
