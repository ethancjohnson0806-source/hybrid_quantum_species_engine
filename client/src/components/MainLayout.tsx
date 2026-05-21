import React, { useState } from 'react';
import SidebarNavigation from '@/components/SidebarNavigation';
import ContentArea from '@/components/ContentArea';

export default function MainLayout() {
  const [activeScreen, setActiveScreen] = useState('chamber-flow');

  return (
    <div className="main-layout">
      <SidebarNavigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <ContentArea activeScreen={activeScreen} />
    </div>
  );
}
