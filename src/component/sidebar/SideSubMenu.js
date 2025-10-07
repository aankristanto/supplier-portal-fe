import { IoIosArrowDown } from "react-icons/io";

const SideSubMenu = ({ title, icon, idSubMenu, children, isActive, onToggle }) => {
  return (
    <div className={`sub-menu ${isActive ? 'showMenu' : ''}`} id={idSubMenu}>
      <li className="nav-link" onClick={onToggle}>
        <div className="a">
          <div className="icon">
            {icon === "settings" && "⚙️"}
            {icon === "box" && "📦"}
          </div>
          <div className="text nav-text">{title}</div>
        </div>
        <div className="arrow-expand">
          <IoIosArrowDown />
        </div>
      </li>
      <div className="sub-link">
        <ul>{children}</ul>
      </div>
    </div>
  );
};

export default SideSubMenu;