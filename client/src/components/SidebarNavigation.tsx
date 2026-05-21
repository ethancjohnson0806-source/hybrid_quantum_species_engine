import React from 'react';

interface Props {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

export default function SidebarNavigation({ activeScreen, onScreenChange }: Props) {
  const screens = [
    { id: 'chamber-flow', label: 'Chamber Flow', icon: '🜁' },
    { id: 'witness-field', label: 'Witness Field', icon: '🜂' },
    { id: 'correction-journal', label: 'Correction Journal', icon: '🜃' },
  ];

  return (
    <nav className="sidebar-navigation">
      {screens.map(screen => (
        <button
          key={screen.id}
          className={`nav-item ${activeScreen === screen.id ? 'active' : ''}`}
          onClick={() => onScreenChange(screen.id)}
        >
          <span className="nav-icon">{screen.icon}</span>
          <span className="nav-label">{screen.label}</span>
        </button>
      ))}
    </nav>
  );
}
