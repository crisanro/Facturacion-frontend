import React, { useState, useEffect } from 'react';
import {
    X,
    CreditCard,
    Zap,
    Check,
    ArrowRight,
    ShieldCheck,
    Package
} from 'lucide-react';
import apiClient from '../api/apiClient';

const BuyCreditsModal = ({ isOpen, onClose }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            const res = await apiClient.get('/api/public/plans');
            setPlans(res.data.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-12 animate-in">
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="glass w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 rounded-[3rem] border-t-8 border-primary shadow-2xl">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <Zap className="text-primary fill-primary" /> Recarga tu Cuenta
                        </h2>
                        <p className="text-muted font-medium">Selecciona el plan que mejor se adapte a tu volumen de facturación.</p>
                    </div>
                    <button onClick={onClose} className="p-3 glass rounded-2xl hover:bg-error/10 hover:text-error transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Plans Content */}
                <div className="p-8 pt-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-20 text-center font-bold animate-pulse text-muted">Consultando planes disponibles...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`glass p-8 rounded-[2.5rem] border-2 transition-all group flex flex-col ${plan.popular ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                                >
                                    {plan.popular && (
                                        <div className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-4 mx-auto">
                                            Más Vendido
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                        <div className="text-4xl font-black text-main mt-4 mb-1">
                                            ${plan.price}
                                        </div>
                                        <div className="text-xs font-bold text-muted uppercase tracking-widest">{plan.credits} Créditos</div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check size={16} className="text-success" />
                                            <span className="text-dim">Facturas autorizadas</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check size={16} className="text-success" />
                                            <span className="text-dim">Envío por correo ilimitado</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Check size={16} className="text-success" />
                                            <span className="text-dim">Almacenamiento XML/PDF</span>
                                        </div>
                                    </div>

                                    <button className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                                        Elegir Plan <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="glass p-6 rounded-3xl bg-secondary/5 border border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 glass rounded-2xl text-primary"><ShieldCheck size={24} /></div>
                            <div>
                                <h4 className="font-bold text-main">Pago Seguro con Stripe</h4>
                                <p className="text-[11px] text-muted">Tus datos bancarios están protegidos y nunca se guardan en nuestro servidor.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <CreditCard size={24} className="text-muted opacity-50" />
                            <Package size={24} className="text-muted opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyCreditsModal;
