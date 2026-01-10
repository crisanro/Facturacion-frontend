import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Terminal,
    Plus,
    Trash2,
    Check,
    X,
    PlusCircle
} from 'lucide-react';
import apiClient from '../api/apiClient';

const Settings = () => {
    const [establishments, setEstablishments] = useState([]);
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddEstab, setShowAddEstab] = useState(false);
    const [showAddPoint, setShowAddPoint] = useState(false);

    const [newEstab, setNewEstab] = useState({
        codigo: '',
        nombre_comercial: '',
        direccion: ''
    });

    const [newPoint, setNewPoint] = useState({
        establecimiento_id: '',
        codigo: '',
        nombre: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [estRes, ptsRes] = await Promise.all([
                apiClient.get('/api/establishments'),
                apiClient.get('/api/puntos-emision')
            ]);
            setEstablishments(estRes.data.data);
            setPoints(ptsRes.data.data);
        } catch (error) {
            console.error('Error fetching settings data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEstablishment = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/establishments', newEstab);
            if (response.data.ok) {
                setShowAddEstab(false);
                setNewEstab({ codigo: '', nombre_comercial: '', direccion: '' });
                fetchData();
            }
        } catch (error) {
            alert('Error al crear establecimiento: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleAddPoint = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/puntos-emision', newPoint);
            if (response.data.ok) {
                setShowAddPoint(false);
                setNewPoint({ establecimiento_id: '', codigo: '', nombre: '' });
                fetchData();
            }
        } catch (error) {
            alert('Error al crear punto de emisión');
        }
    };

    const handleDeleteEstablishment = async (id) => {
        if (!window.confirm('¿Eliminar establecimiento? Esto afectará a sus puntos de emisión.')) return;
        try {
            await apiClient.delete(`/api/establishments/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleDeletePoint = async (id) => {
        if (!window.confirm('¿Eliminar punto de emisión?')) return;
        try {
            await apiClient.delete(`/api/puntos-emision/${id}`);
            fetchData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando estructura...</div>;

    return (
        <div className="settings-page">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Estructura Organizacional</h1>
                <p className="text-muted">Administra tus locales y cajas de emisión.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Section 1: Establishments */}
                <div className="glass p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-primary" />
                            <h2 className="text-xl font-bold">Establecimientos (Locales)</h2>
                        </div>
                        <button
                            onClick={() => setShowAddEstab(!showAddEstab)}
                            className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors"
                        >
                            {showAddEstab ? <X size={16} /> : <Plus size={16} />}
                            {showAddEstab ? 'Cancelar' : 'Nuevo Local'}
                        </button>
                    </div>

                    {showAddEstab && (
                        <form onSubmit={handleAddEstablishment} className="mb-8 p-6 bg-white/5 rounded-xl border border-primary/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-group">
                                    <label className="form-label text-xs">Código (Ej. 001)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        maxLength="3"
                                        placeholder="001"
                                        value={newEstab.codigo}
                                        onChange={(e) => setNewEstab({ ...newEstab, codigo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Matriz Principal"
                                        value={newEstab.nombre_comercial}
                                        onChange={(e) => setNewEstab({ ...newEstab, nombre_comercial: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Quito, Ecuador"
                                        value={newEstab.direccion}
                                        onChange={(e) => setNewEstab({ ...newEstab, direccion: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary mt-4 py-2">Crear Establecimiento</button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-muted border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Cód.</th>
                                    <th className="px-4 py-3 font-semibold">Nombre</th>
                                    <th className="px-4 py-3 font-semibold">Dirección</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {establishments.map((est) => (
                                    <tr key={est.id} className="hover:bg-white/5">
                                        <td className="px-4 py-4 font-mono text-primary font-bold">{est.codigo}</td>
                                        <td className="px-4 py-4">{est.nombre_comercial}</td>
                                        <td className="px-4 py-4 text-muted">{est.direccion}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button onClick={() => handleDeleteEstablishment(est.id)} className="text-error hover:bg-error/10 p-2 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Emission Points */}
                <div className="glass p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Terminal className="text-primary" />
                            <h2 className="text-xl font-bold">Puntos de Emisión (Cajas)</h2>
                        </div>
                        <button
                            onClick={() => setShowAddPoint(!showAddPoint)}
                            className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors"
                        >
                            {showAddPoint ? <X size={16} /> : <Plus size={16} />}
                            {showAddPoint ? 'Cancelar' : 'Nueva Caja'}
                        </button>
                    </div>

                    {showAddPoint && (
                        <form onSubmit={handleAddPoint} className="mb-8 p-6 bg-white/5 rounded-xl border border-primary/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-group">
                                    <label className="form-label text-xs">Establecimiento</label>
                                    <select
                                        className="form-input bg-dark"
                                        value={newPoint.establecimiento_id}
                                        onChange={(e) => setNewPoint({ ...newPoint, establecimiento_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar Local</option>
                                        {establishments.map(e => <option key={e.id} value={e.id}>{e.codigo} - {e.nombre_comercial}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Código (Ej. 100)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        maxLength="3"
                                        placeholder="100"
                                        value={newPoint.codigo}
                                        onChange={(e) => setNewPoint({ ...newPoint, codigo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Nombre descriptivo</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Caja Principal"
                                        value={newPoint.nombre}
                                        onChange={(e) => setNewPoint({ ...newPoint, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary mt-4 py-2">Crear Punto</button>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-muted border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Cód.</th>
                                    <th className="px-4 py-3 font-semibold">Nombre</th>
                                    <th className="px-4 py-3 font-semibold">Local</th>
                                    <th className="px-4 py-3 font-semibold text-right">Secuencial Actual</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {points.map((pt) => (
                                    <tr key={pt.id} className="hover:bg-white/5">
                                        <td className="px-4 py-4 font-mono text-primary font-bold">{pt.codigo}</td>
                                        <td className="px-4 py-4">{pt.nombre}</td>
                                        <td className="px-4 py-4 text-muted">{pt.establecimiento?.codigo} - {pt.establecimiento?.nombre_comercial}</td>
                                        <td className="px-4 py-4 text-right font-mono">{pt.secuencial_actual}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button onClick={() => handleDeletePoint(pt.id)} className="text-error hover:bg-error/10 p-2 rounded-lg">
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
        </div>
    );
};

export default Settings;
