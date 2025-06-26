import { useState } from "react";
import { Link } from "react-router";

interface HeaderProps {
  onClick?: () => void;
  onToggle?: () => void;
}

export function Header() {
  const Header: React.FC<HeaderProps> = ({ onClick, onToggle }) => {
    const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
    return <div>Header</div>;
  };
}
