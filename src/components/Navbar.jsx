import React, { useState, useEffect } from 'react';
import {
    Bell,
    CreditCard,
    User,
    ChevronDown,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const Navbar = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await apiClient.get('/api/credits');
                const val = response.data.data?.balance ?? response.data.balance ?? (typeof response.data.data === 'number' ? response.data.data : 0);
                setCredits(val);

            } catch (error) {

                console.error('Error fetching credits:', error);
            }
        };
        fetchCredits();

        // Poll every 5 minutes
        const interval = setInterval(fetchCredits, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="navbar">
            <div className="flex items-center gap-8">
                <h1 className="text-lg font-bold tracking-tight opacity-50">Panel General</h1>
            </div>

            <div className="flex items-center gap-8">
                {/* Credits Display */}
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full glass border ${credits <= 15 ? 'border-warning/30 bg-warning/10' : 'border-primary/20 bg-primary/5'}`}>
                    <CreditCard size={18} className={credits <= 15 ? 'text-warning' : 'text-primary'} />
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] uppercase font-bold text-muted mb-0.5">Saldo Créditos</span>
                        <span className={`text-sm font-black ${credits <= 15 ? 'text-warning' : 'text-main'}`}>{credits}</span>
                    </div>
                    {credits <= 15 && <AlertTriangle size={14} className="text-warning animate-pulse" />}
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2.5 rounded-xl hover:bg-glass transition-colors text-muted hover:text-main">
                        <Bell size={20} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4 pl-8 border-l border-border">
                    <div className="flex flex-col items-end leading-none hidden md:flex">
                        <span className="text-sm font-bold text-main">{user?.email?.split('@')[0]}</span>
                        <span className="text-[10px] text-muted">Empresa Activa</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg transform active:scale-95 transition-transform cursor-pointer">
                        <User size={20} className="text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
