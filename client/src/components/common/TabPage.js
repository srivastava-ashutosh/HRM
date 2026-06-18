import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const TabPage = ({ tabs, defaultTab, moduleIcon: ModuleIcon, moduleTitle }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || defaultTab || tabs[0]?.key;

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const activeContent = tabs.find(t => t.key === activeTab);
  const ActiveComponent = activeContent?.component;

  return (
    <div>
      <div className="tab-header">
        <div className="tab-header-title">
          {ModuleIcon && <ModuleIcon size={20} />}
          <h3>{moduleTitle}</h3>
        </div>
        <div className="tab-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {Icon && <Icon size={15} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="tab-content">
        {ActiveComponent ? <ActiveComponent /> : <div className="loading-screen"><div className="spinner"></div></div>}
      </div>
    </div>
  );
};

export default TabPage;
