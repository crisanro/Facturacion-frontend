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
    AlertCircle
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const NewInvoice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [establishments, setEstablishments] = useState([]);
    const [points, setPoints] = useState([]);

    // Invoice State
    const [invoice, setInvoice] = useState({
        establecimiento: '',
        punto_emision: '',
        formato: 1,
        cliente: {
            razonSocial: '',
            tipoId: '05', // '05' is Cédula, '04' is RUC
            identificacion: '',
            email: ''
        },
        items: [
            { codigo: '', descripcion: '', cantidad: 1, precio: 0 }
        ],
        pagos: [
            { formaPago: '01', total: 0 }
        ]
    });

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

            // Auto-select defaults if available
            if (estRes.data.data.length > 0) {
                setInvoice(prev => ({
                    ...prev,
                    establecimiento: estRes.data.data[0].codigo
                }));
            }
            if (ptsRes.data.data.length > 0) {
                setInvoice(prev => ({
                    ...prev,
                    punto_emision: ptsRes.data.data[0].codigo
                }));
            }
        } catch (error) {
            console.error('Error fetching structure:', error);
        }
    };

    // Calculations
    const calculateSubtotal = () => {
        return invoice.items.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
    };

    const calculateIVA = () => {
        return calculateSubtotal() * 0.15;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateIVA();
    };

    // Sync payments total with invoice total
    useEffect(() => {
        const total = calculateTotal();
        setInvoice(prev => ({
            ...prev,
            pagos: [{ ...prev.pagos[0], total: parseFloat(total.toFixed(2)) }]
        }));
    }, [invoice.items]);

    // Handlers
    const handleClientChange = (e) => {
        const { name, value } = e.target;
        setInvoice({
            ...invoice,
            cliente: { ...invoice.cliente, [name]: value }
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = field === 'cantidad' || field === 'precio' ? parseFloat(value) || 0 : value;
        setInvoice({ ...invoice, items: newItems });
    };

    const addItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { codigo: '', descripcion: '', cantidad: 1, precio: 0 }]
        });
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) return;
        const newItems = [...invoice.items];
        newItems.splice(index, 1);
        setInvoice({ ...invoice, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await apiClient.post('/api/facturar', invoice);
            if (response.data.ok) {
                setResult({ type: 'success', data: response.data.datos });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: error.response?.data?.mensaje || 'Error al emitir factura',
                detail: error.response?.data?.detalle
            });
        } finally {
            setLoading(false);
        }
    };

    if (result?.type === 'success') {
        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="glass p-10 rounded-2xl text-center">
                    <CheckCircle size={80} className="text-success mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-2">¡Factura Autorizada!</h1>
                    <p className="text-muted mb-8">La factura ha sido enviada con éxito al SRI y al cliente.</p>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-left mb-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Clave de Acceso:</span>
                            <span className="font-mono text-xs">{result.data.claveAcceso}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Estado:</span>
                            <span className="text-success font-bold">{result.data.estado}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <a href={result.data.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary flex-1 py-3">Ver PDF (RIDE)</a>
                        <button onClick={() => navigate('/dashboard')} className="glass flex-1 py-3 text-white border-white/10">Volver al Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-invoice-page pb-20">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Nueva Factura Electrónica</h1>
                    <p className="text-muted">Completa los datos para emitir un nuevo comprobante.</p>
                </div>
                <div className="flex gap-4">
                    <div className="form-group mb-0">
                        <label className="text-[10px] uppercase font-bold text-muted mb-1 block">Local</label>
                        <select
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white"
                            value={invoice.establecimiento}
                            onChange={(e) => setInvoice({ ...invoice, establecimiento: e.target.value })}
                        >
                            {establishments.map(e => <option key={e.id} value={e.codigo}>{e.codigo}</option>)}
                        </select>
                    </div>
                    <div className="form-group mb-0">
                        <label className="text-[10px] uppercase font-bold text-muted mb-1 block">Punto</label>
                        <select
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white"
                            value={invoice.punto_emision}
                            onChange={(e) => setInvoice({ ...invoice, punto_emision: e.target.value })}
                        >
                            {points.filter(p => p.establecimiento?.codigo === invoice.establecimiento).map(p => (
                                <option key={p.id} value={p.codigo}>{p.codigo}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {result?.type === 'error' && (
                <div className="alert alert-error mb-6 flex items-start gap-3">
                    <AlertCircle className="shrink-0" />
                    <div>
                        <div className="font-bold">{result.message}</div>
                        {result.detail && <div className="text-xs mt-1 opacity-80">{JSON.stringify(result.detail)}</div>}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Client Selection */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={20} className="text-primary" />
                            <h2 className="text-lg font-bold">Datos del Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Tipo ID</label>
                                <select
                                    name="tipoId"
                                    className="form-input"
                                    value={invoice.cliente.tipoId}
                                    onChange={handleClientChange}
                                >
                                    <option value="05">Cédula</option>
                                    <option value="04">RUC</option>
                                    <option value="06">Pasaporte</option>
                                    <option value="07">Consumidor Final</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Identificación</label>
                                <input
                                    type="text"
                                    name="identificacion"
                                    className="form-input"
                                    placeholder="Ej. 1307... / 9999..."
                                    value={invoice.cliente.identificacion}
                                    onChange={handleClientChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Razón Social</label>
                                <input
                                    type="text"
                                    name="razonSocial"
                                    className="form-input"
                                    placeholder="NOMBRE DEL CLIENTE"
                                    value={invoice.cliente.razonSocial}
                                    onChange={handleClientChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="cliente@mail.com"
                                    value={invoice.cliente.email}
                                    onChange={handleClientChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="glass p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={20} className="text-primary" />
                                <h2 className="text-lg font-bold">Detalle de Productos/Servicios</h2>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-primary hover:bg-primary/10 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                                <Plus size={16} /> Añadir Item
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {invoice.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-muted block mb-1">Código</label>
                                        <input
                                            type="text"
                                            className="form-input py-1.5 text-xs"
                                            value={item.codigo}
                                            onChange={(e) => handleItemChange(index, 'codigo', e.target.value)}
                                            placeholder="P001"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="text-[10px] text-muted block mb-1">Descripción</label>
                                        <input
                                            type="text"
                                            className="form-input py-1.5 text-xs"
                                            value={item.descripcion}
                                            onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                                            placeholder="Servicio de..."
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-muted block mb-1">Cant.</label>
                                        <input
                                            type="number"
                                            className="form-input py-1.5 text-xs"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                            min="0.01"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-muted block mb-1">Precio Unit.</label>
                                        <input
                                            type="number"
                                            className="form-input py-1.5 text-xs"
                                            value={item.precio}
                                            onChange={(e) => handleItemChange(index, 'precio', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <label className="text-[10px] text-muted block mb-1">Total</label>
                                        <div className="text-sm font-bold">${(item.cantidad * item.precio).toFixed(2)}</div>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button type="button" onClick={() => removeItem(index)} className="text-error/50 hover:text-error">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Totals & Payment */}
                <div className="flex flex-col gap-6">
                    <div className="glass p-6 rounded-xl overflow-hidden border-t-4 border-primary">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" /> Resumen de Factura
                        </h2>

                        <div className="flex flex-col gap-3 mb-6">
                            <div className="flex justify-between text-muted">
                                <span>Subtotal (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-muted">
                                <span>Subtotal (15%)</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted border-t border-white/10 pt-3">
                                <span>IVA (15%)</span>
                                <span>${calculateIVA().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-white pt-3">
                                <span>TOTAL</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Forma de Pago</label>
                            <select className="form-input">
                                <option value="01">Sin utilización del sistema financiero (Efectivo)</option>
                                <option value="19">Tarjeta de Crédito</option>
                                <option value="20">Otros con utilización del sistema financiero</option>
                                <option value="16">Tarjeta de Débito</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-4 mt-4 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                'Procesando con SRI...'
                            ) : (
                                <> <Send size={18} /> Emitir Factura Ahora </>
                            )}
                        </button>
                    </div>

                    <div className="glass p-4 rounded-xl flex items-center gap-3">
                        <Building className="text-muted" size={32} />
                        <div className="text-xs text-muted">
                            Esta factura será firmada digitalmente y enviada automáticamente a los servidores del SRI.
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewInvoice;
