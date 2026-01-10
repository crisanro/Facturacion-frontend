import React, { useState, useEffect } from 'react';
import { Bell, User, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const Navbar = () => {
    const { user } = useAuth();
    const [credits, setCredits] = useState(null);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await apiClient.get('/api/credits');
                if (response.data.ok) {
                    setCredits(response.data.balance);
                }
            } catch (error) {
                console.error('Error fetching credits:', error);
            }
        };

        if (user) {
            fetchCredits();
            // Polling every 5 minutes or set up a listener
            const interval = setInterval(fetchCredits, 300000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <header className="navbar glass">
            <div className="navbar-left">
                <h2 className="page-title">Sistema de Facturación</h2>
            </div>

            <div className="navbar-right">
                {credits !== null && (
                    <div className={`credit-badge ${credits <= 15 ? 'warning' : ''}`}>
                        <Wallet size={16} />
                        <span>{credits} Créditos</span>
                    </div>
                )}

                <div className="user-profile">
                    <div className="user-info">
                        <span className="user-name">{user?.email?.split('@')[0]}</span>
                        <span className="user-role">Emisor</span>
                    </div>
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
