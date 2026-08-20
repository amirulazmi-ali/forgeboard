import {
  ChevronDown,
  Factory,
  LayoutDashboard,
  MonitorPlay,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({
  copy,
  user,
  popup,
  canRecord,
  canSetup,
  canAdmin,
  onRecord,
  onAdmin,
  onLogout,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Factory size={19} />
        </span>
        <span>{copy.brand}</span>
      </div>
      <div className="site-select">
        <span className="status-dot" /> Plant 04 <ChevronDown size={14} />
      </div>
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive && !popup ? "active" : ""}`
          }
          style={{ textDecoration: "none" }}
        >
          <LayoutDashboard size={17} /> Overview
        </NavLink>
        {canRecord && (
          <button className="nav-item" onClick={onRecord}>
            <MonitorPlay size={17} /> {copy.operatorNav}
          </button>
        )}
        {canSetup && (
          <NavLink
            to="/setup"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            style={{ textDecoration: "none" }}
          >
            <Settings2 size={17} /> {copy.engineerNav}
          </NavLink>
        )}
        {canAdmin && (
          <button className="nav-item" onClick={onAdmin}>
            <ShieldCheck size={17} /> {copy.adminNav}
          </button>
        )}
      </nav>
      <div className="sidebar-foot">
        <div className="sync">
          <span className="status-dot" /> All systems synced
        </div>
        <div className="user">
          <span className="avatar">MS</span>
          <div>
            <strong>Mina Sato</strong>
            <small>{user.role}</small>
          </div>
          <button className="logout-button" onClick={onLogout} title="Sign out">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
