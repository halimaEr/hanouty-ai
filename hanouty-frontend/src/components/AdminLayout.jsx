import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Tag, LayoutDashboard, ChevronRight, Moon, Sun,
  ShoppingBag, Users, Brain, Package, LogOut,
  User, Mail, History, Loader2
} from "lucide-react";
import { authServices } from "../services/authServices";

const navItems = [
  { label: "Dashboard",  icon: LayoutDashboard, path: "/admin/dash" },
  { label: "Catégorie",  icon: Package,         path: "/admin/categories" },
  { label: "Marques",    icon: Tag,             path: "/admin/marques" },
  { label: "Produits",   icon: ShoppingBag,     path: "/admin/produits" },
  { label: "Clients",    icon: Users,           path: "/admin/clients" },
  { label: "Comptes",    icon: Users,           path: "/admin/comptes" },
  { label: "New data",   icon: History,         path: "/admin/images/new" },
];

const TITLES = {
  "/admin/dash":        "Dashboard",
  "/admin/categories":  "Catégories",
  "/admin/marques":     "Marques",
  "/admin/produits":    "Produits",
  "/admin/clients":     "Clients",
  "/admin/comptes":     "Comptes en attente",
  "/admin/images/new":  "New data",
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const dropdownRef = useRef(null);

  // Titre dynamique selon la route active
  const title = TITLES[location.pathname] ?? "Admin";

  // Thème
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Auth
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (!authServices.isLoged()) { navigate("/login"); return; }
      try {
        const response = await authServices.getUserConnecte();
        if (isMounted) { setUser(response.data); setLoading(false); }
      } catch (error) {
        console.error("Erreur session:", error);
        authServices.logOut();
        if (isMounted) navigate("/login");
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [navigate]);

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { authServices.logOut(); navigate("/login"); };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? "bg-[#0B1120]" : "bg-[#F8FAFC]"}`}>
        <Loader2 className={`animate-spin ${isDarkMode ? "text-[#38BDF8]" : "text-[#3B82F6]"}`} size={32} />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden font-sans transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-body)", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg-body: #F8FAFC; --bg-topbar: #FFFFFF;
          --text-primary: #0F172A; --text-secondary: #64748B;
          --border-color: #E2E8F0;
          --sidebar-bg: #0B1120; --sidebar-border: #1E293B;
          --sidebar-text: #94A3B8; --sidebar-text-active: #FFFFFF;
          --sidebar-hover-bg: rgba(255,255,255,0.05);
          --sidebar-active-bg: #3B82F6; --sidebar-logo-text: #FFFFFF;
          --brand-gradient: linear-gradient(135deg,#60A5FA 0%,#3B82F6 100%);
          --topbar-icon-hover: #3B82F6; --dropdown-hover: #F1F5F9;
        }
        .dark {
          --bg-body: #050810; --bg-topbar: #0B1120;
          --text-primary: #F8FAFC; --text-secondary: #94A3B8;
          --border-color: rgba(56,189,248,0.15);
          --sidebar-bg: #050810; --sidebar-border: rgba(56,189,248,0.15);
          --sidebar-text: #94A3B8; --sidebar-text-active: #38BDF8;
          --sidebar-hover-bg: rgba(56,189,248,0.08);
          --sidebar-active-bg: rgba(56,189,248,0.15); --sidebar-logo-text: #F8FAFC;
          --brand-gradient: linear-gradient(135deg,#7DD3FC 0%,#38BDF8 100%);
          --topbar-icon-hover: #38BDF8; --dropdown-hover: rgba(56,189,248,0.1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sidebar {
          width: 240px; min-height: 100vh; background: var(--sidebar-bg);
          display: flex; flex-direction: column; z-index: 100;
          transition: background 0.3s ease, border-color 0.3s ease;
          border-right: 1px solid var(--sidebar-border);
        }
        .sidebar-logo {
          height: 76px; display: flex; align-items: center; padding: 0 24px;
          border-bottom: 1px solid var(--sidebar-border);
        }
        .logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--brand-gradient);
          display: flex; align-items: center; justify-content: center;
          color: white; margin-right: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .logo-text { font-size: 20px; font-weight: 800; color: var(--sidebar-logo-text); letter-spacing: -0.5px; }
        .sidebar-nav { flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 4px; }
        .nav-section-label {
          font-size: 11px; font-weight: 700; color: var(--sidebar-text); opacity: 0.6;
          text-transform: uppercase; letter-spacing: 1px; padding: 0 12px; margin: 12px 0 8px;
        }
        .nav-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px;
          border-radius: 12px; font-size: 14px; font-weight: 500;
          text-decoration: none; color: var(--sidebar-text); transition: all 0.2s ease;
        }
        .nav-link:hover { background: var(--sidebar-hover-bg); color: var(--sidebar-text-active); }
        .nav-link.active {
          background: var(--sidebar-active-bg); color: var(--sidebar-text-active);
          font-weight: 700; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .topbar {
          position: relative; height: 76px; background: var(--bg-topbar);
          border-bottom: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; z-index: 90;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
        .breadcrumb-current { color: var(--text-primary); font-weight: 700; font-size: 16px; }
        .topbar-actions { display: flex; align-items: center; gap: 14px; }
        .icon-btn {
          width: 42px; height: 42px; border-radius: 50%;
          border: 1.5px solid var(--border-color);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-secondary); background: transparent;
          transition: all 0.2s; position: relative;
        }
        .icon-btn:hover { background: var(--dropdown-hover); color: var(--topbar-icon-hover); border-color: var(--topbar-icon-hover); }
        .avatar-btn {
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--brand-gradient);
          display: flex; align-items: center; justify-content: center;
          color: #fff; cursor: pointer; border: 2px solid var(--bg-topbar);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.2s;
        }
        .avatar-btn:hover { transform: scale(1.05); }
        .profile-dropdown {
          position: absolute; top: 60px; right: 0; width: 260px;
          background: var(--bg-topbar); border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid var(--border-color);
          padding: 8px; z-index: 1000;
          animation: fadeIn 0.2s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
        .dropdown-header { padding: 16px 14px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px; }
        .dropdown-email { font-size: 13px; color: var(--text-secondary); word-break: break-all; display: flex; align-items: center; gap: 8px; }
        .dropdown-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--text-secondary);
          cursor: pointer; transition: all 0.2s; border: none; background: none; width: 100%; text-align: left;
        }
        .dropdown-item:hover { background: var(--dropdown-hover); color: var(--topbar-icon-hover); }
        .dropdown-divider { height: 1px; background: var(--border-color); margin: 6px 0; }
        .dropdown-item.logout { color: #E11D48; }
        .dropdown-item.logout:hover { background: rgba(225,29,72,0.1); color: #BE123C; }
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 1; }
        .page-content { flex: 1; overflow-y: auto; padding: 32px; z-index: 1; position: relative; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="logo-text">Dashboard</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`nav-link${active ? " active" : ""}`}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Admin</span>
            <ChevronRight size={16} />
            <span className="breadcrumb-current">{title}</span>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Mode clair" : "Mode sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div ref={dropdownRef} style={{ position: "relative" }}>
              <div
                className="avatar-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="Profil"
              >
                <User size={20} strokeWidth={2.5} />
              </div>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-email">
                      <Mail size={14} />
                      {user?.email || "Chargement..."}
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ← Outlet remplace {children} : seul le contenu change à la navigation */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}