import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    LogOut,
    PlusCircle,
    Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Nueva Factura', path: '/new-invoice', icon: <PlusCircle size={20} /> },
        { name: 'Historial', path: '/history', icon: <History size={20} /> },
        { name: 'Emisor', path: '/profile', icon: <Building2 size={20} /> },
        { name: 'Configuración', path: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="sidebar glass">
            <div className="sidebar-header">
                <div className="logo">
                    <FileText className="logo-icon" size={28} />
                    <span className="logo-text">SRI Factura</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
