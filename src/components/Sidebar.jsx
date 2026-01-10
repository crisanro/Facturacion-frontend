import React from 'react';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    Building2,
    Settings as SettingsIcon,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/new-invoice', icon: PlusCircle, label: 'Nueva Factura' },
        { path: '/history', icon: History, label: 'Historial' },
        { path: '/profile', icon: Building2, label: 'Mi Perfil' },
        { path: '/settings', icon: SettingsIcon, label: 'Configuración' },
    ];

    return (
        <aside className="sidebar">
            <div className="mb-12 px-6">
                <h2 className="text-2xl font-black text-primary tracking-tighter">SRI<span className="text-main">Flow</span></h2>
            </div>

            <nav className="flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={22} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
                {/* Theme Switcher Toggle */}
                <button
                    onClick={toggleTheme}
                    className="sidebar-link border-t border-border pt-4 mt-4"
                    style={{ borderTop: '1px solid hsl(var(--border))', background: 'transparent' }}
                >
                    {theme === 'dark' ? <Sun size={22} className="text-warning" /> : <Moon size={22} className="text-secondary" />}
                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>

                <button
                    onClick={logout}
                    className="sidebar-link text-error hover:bg-error/10"
                    style={{ background: 'transparent' }}
                >
                    <LogOut size={22} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
