import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Send,
    User,
    ShoppingCart,
    CreditCard,
    Building,
    CheckCircle,
    AlertCircle,
    Hash,
    Code,
    RefreshCw,
    DollarSign
} from 'lucide-react';

import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const NewInvoice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [establishments, setEstablishments] = useState([]);
    const [points, setPoints] = useState([]);

    const [invoice, setInvoice] = useState({
        establecimiento: '',
        punto_emision: '',
        formato: 1,
        cliente: { razonSocial: '', tipoId: '05', identificacion: '', email: '' },
        items: [{ codigo: '', descripcion: '', cantidad: 1, precio: 0 }],
        pagos: [{ formaPago: '01', total: 0 }]
    });

    const [isJsonMode, setIsJsonMode] = useState(false);
    const [rawJson, setRawJson] = useState('');


    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchStructure = async () => {
        try {
            const [estRes, ptsRes] = await Promise.all([
                apiClient.get('/api/establishments'),
                apiClient.get('/api/puntos-emision')
            ]);
            setEstablishments(estRes.data.data);
            setPoints(ptsRes.data.data);
            if (estRes.data.data.length > 0) setInvoice(prev => ({ ...prev, establecimiento: estRes.data.data[0].codigo }));
            if (ptsRes.data.data.length > 0) setInvoice(prev => ({ ...prev, punto_emision: ptsRes.data.data[0].codigo }));
        } catch (error) {
            console.error('Error fetching structure:', error);
        }
    };

    const calculateSubtotal = () => invoice.items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    const calculateIVA = () => calculateSubtotal() * 0.15;
    const calculateTotal = () => calculateSubtotal() + calculateIVA();

    useEffect(() => {
        const total = calculateTotal();
        setInvoice(prev => ({
            ...prev,
            pagos: [{ ...prev.pagos[0], total: parseFloat(total.toFixed(2)) }]
        }));
    }, [invoice.items]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let payload;
            if (isJsonMode) {
                try {
                    payload = JSON.parse(rawJson);
                } catch (err) {
                    alert('JSON inválido. Por favor revisa el formato.');
                    setLoading(false);
                    return;
                }
            } else {
                payload = { ...invoice, detalles: invoice.items };
                delete payload.items;
            }

            const response = await apiClient.post('/api/facturar', payload);
            if (response.data.ok) setResult({ type: 'success', data: response.data.datos });

        } catch (error) {
            setResult({ type: 'error', message: error.response?.data?.mensaje || 'Error al emitir' });
        } finally {
            setLoading(false);
        }
    };


    if (result?.type === 'success') {
        return (
            <div className="content-page flex items-center justify-center min-vh-80 animate-in">
                <div className="glass p-12 rounded-3xl text-center max-w-xl border-t-8 border-success">
                    <CheckCircle size={80} className="text-success mx-auto mb-8" />
                    <h1 className="text-4xl font-black mb-4">¡Factura Exitosa!</h1>
                    <p className="text-muted mb-10 font-medium">El comprobante ha sido procesado por el SRI y notificado al cliente.</p>
                    <div className="flex flex-col gap-4">
                        <a href={result.data.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary py-4">Descargar RIDE (PDF)</a>
                        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Volver al Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-page animate-in">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-black mb-2">Emisión de Factura</h1>
                    <p className="text-muted">Nuevo comprobante electrónico para el SRI.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setIsJsonMode(!isJsonMode)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isJsonMode ? 'bg-secondary text-white shadow-lg' : 'bg-glass text-muted hover:text-main'}`}
                    >
                        <Code size={18} /> {isJsonMode ? 'Modo Formulario' : 'Modo Bridge (JSON)'}
                    </button>
                    {!isJsonMode && (
                        <div className="flex items-center gap-4 glass p-2 rounded-2xl">
                            <div className="form-group mb-0">
                                <select className="bg-transparent border-none text-xs font-black text-primary px-4 py-2 uppercase"
                                    value={invoice.establecimiento} onChange={e => setInvoice({ ...invoice, establecimiento: e.target.value })}>
                                    {establishments.map(e => <option key={e.id} value={e.codigo}>Local {e.codigo}</option>)}
                                </select>
                            </div>
                            <div className="form-group mb-0 border-l border-border pl-2">
                                <select className="bg-transparent border-none text-xs font-black text-secondary px-4 py-2 uppercase"
                                    value={invoice.punto_emision} onChange={e => setInvoice({ ...invoice, punto_emision: e.target.value })}>
                                    {points.filter(p => p.establecimiento?.codigo === invoice.establecimiento).map(p => (
                                        <option key={p.id} value={p.codigo}>Caja {p.codigo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {isJsonMode ? (
                <div className="grid grid-cols-1 gap-8 animate-in">
                    <div className="glass p-10 rounded-3xl border-t-8 border-secondary">
                        <div className="flex items-center gap-3 mb-6">
                            <Code size={24} className="text-secondary" />
                            <h2 className="text-xl font-bold">Bridge JSON (Developer Mode)</h2>
                        </div>
                        <p className="text-sm text-muted mb-8">
                            Pega aquí el JSON completo de la factura. El frontend lo enviará directamente a <code>/api/facturar</code> actuando como un puente.
                        </p>
                        <div className="form-group">
                            <textarea
                                className="form-input font-mono text-xs h-[400px] leading-relaxed p-6 bg-main/5"
                                placeholder='{ "establecimiento": "001", "punto_emision": "100", ... }'
                                value={rawJson}
                                onChange={e => setRawJson(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !rawJson}
                                className="btn-primary px-10 py-4 bg-secondary border-none"
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                                {loading ? 'Enviando JSON...' : 'Enviar vía Bridge'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* ... (existing form code) ... */}
                    <div className="lg:col-span-2 flex flex-col gap-10">
                        <div className="glass p-10 rounded-3xl">
                            <div className="flex items-center gap-3 mb-8">
                                <User size={24} className="text-primary" />
                                <h2 className="text-xl font-bold">Datos del Receptor</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <div className="form-group">
                                    <label className="form-label">Tipo de Identificación</label>
                                    <select className="form-input" value={invoice.cliente.tipoId}
                                        onChange={e => setInvoice({ ...invoice, cliente: { ...invoice.cliente, tipoId: e.target.value } })}>
                                        <option value="05">Cédula</option><option value="04">RUC</option><option value="06">Pasaporte</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Número Identificación</label>
                                    <input type="text" className="form-input" placeholder="Ej. 17..." required
                                        value={invoice.cliente.identificacion} onChange={e => setInvoice({ ...invoice, cliente: { ...invoice.cliente, identificacion: e.target.value } })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Razón Social / Nombres</label>
                                    <input type="text" className="form-input" required
                                        value={invoice.cliente.razonSocial} onChange={e => setInvoice({ ...invoice, cliente: { ...invoice.cliente, razonSocial: e.target.value } })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input type="email" className="form-input" required
                                        value={invoice.cliente.email} onChange={e => setInvoice({ ...invoice, cliente: { ...invoice.cliente, email: e.target.value } })} />
                                </div>
                            </div>
                        </div>

                        <div className="glass p-10 rounded-3xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold flex items-center gap-3"><ShoppingCart size={24} className="text-primary" /> Detalle de Ítems</h2>
                                <button type="button" onClick={() => setInvoice({ ...invoice, items: [...invoice.items, { codigo: '', descripcion: '', cantidad: 1, precio: 0 }] })}
                                    className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all">+ Añadir Ítem</button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {invoice.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-6 items-end group p-6 bg-glass border border-border rounded-2xl">
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-black text-dim mb-2 block">Código</label>
                                            <input type="text" className="form-input py-2 text-sm" value={item.codigo} required
                                                onChange={e => { const i = [...invoice.items]; i[index].codigo = e.target.value; setInvoice({ ...invoice, items: i }) }} />
                                        </div>
                                        <div className="col-span-4">
                                            <label className="text-[10px] uppercase font-black text-dim mb-2 block">Descripción</label>
                                            <input type="text" className="form-input py-2 text-sm" value={item.descripcion} required
                                                onChange={e => { const i = [...invoice.items]; i[index].descripcion = e.target.value; setInvoice({ ...invoice, items: i }) }} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-black text-dim mb-2 block">Cant.</label>
                                            <input type="number" className="form-input py-2 text-sm" value={item.cantidad} step="0.01"
                                                onChange={e => { const i = [...invoice.items]; i[index].cantidad = parseFloat(e.target.value); setInvoice({ ...invoice, items: i }) }} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-black text-dim mb-2 block">P. Unit</label>
                                            <input type="number" className="form-input py-2 text-sm" value={item.precio} step="0.01"
                                                onChange={e => { const i = [...invoice.items]; i[index].precio = parseFloat(e.target.value); setInvoice({ ...invoice, items: i }) }} />
                                        </div>
                                        <div className="col-span-2 flex justify-between items-center h-full pt-6">
                                            <div className="text-sm font-black text-main">${(item.cantidad * item.precio).toFixed(2)}</div>
                                            <button type="button" onClick={() => { const i = [...invoice.items]; i.splice(index, 1); setInvoice({ ...invoice, items: i }) }}
                                                className="text-error opacity-30 hover:opacity-100"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="glass p-10 rounded-3xl border-t-8 border-primary sticky top-24">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2"><DollarSign size={24} className="text-primary" /> Totales</h2>
                            <div className="flex flex-col gap-4 text-sm font-bold mb-8">
                                <div className="flex justify-between text-muted"><span>Subtotal (Neto)</span><span>${calculateSubtotal().toFixed(2)}</span></div>
                                <div className="flex justify-between text-muted border-b border-border pb-4"><span>IVA (15%)</span><span>${calculateIVA().toFixed(2)}</span></div>
                                <div className="flex justify-between text-2xl font-black text-main pt-2"><span>TOTAL</span><span>${calculateTotal().toFixed(2)}</span></div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Forma de Pago SRI</label>
                                <select className="form-input bg-bg-secondary border-border">
                                    <option value="01">01 - Efectivo / Otros</option>
                                    <option value="19">19 - Tarjeta de Crédito</option>
                                    <option value="20">20 - Transf. Bancaria</option>
                                </select>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-lg shadow-2xl">
                                {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                                {loading ? 'Firmando Comprobante...' : 'Emitir Factura'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

        </div>
    );
};

export default NewInvoice;
