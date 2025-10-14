import { useNavigate } from "react-router-dom";

const SideMenu = ({ title, link, icon, isActive, onClick }) => {
  const navigate = useNavigate();

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (link) {
      navigate(link);
      onClick && onClick();
    }
  };

  return (
    <li className={`nav-link ${isActive ? 'active' : ''}`} style={{cursor: 'pointer'}}>
      <div className="a" onClick={handleNavigate}>
        <div className="icon">
          {icon === "home" && "🏠"}
          {icon === "clipboard" && "📋"}
          {icon === "calendar" && "📅"}
          {icon === "scissors" && "✂️"}
          {icon === "checkmark" && "✅"}
          {icon === "document" && "📄"}
          {icon === "settings" && "⚙️"}
          {icon === "box" && "📦"}
        </div>
        <div className="text nav-text">{title}</div>
      </div>
    </li>
  );
};

export default SideMenu;