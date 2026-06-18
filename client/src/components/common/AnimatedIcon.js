import React from 'react';

const AnimatedIcon = ({ icon: Icon, size = 24, color, animation = 'pulse', style, ...props }) => {
  return (
    <span
      className={`animated-icon animated-${animation}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      <Icon size={size} color={color} {...props} />
    </span>
  );
};

export const IconWidget = ({ icon: Icon, label, value, color, bgColor, animation = 'bounce' }) => {
  return (
    <div className="icon-widget" style={{ '--widget-bg': bgColor, '--widget-color': color }}>
      <div className="icon-widget-icon">
        <AnimatedIcon icon={Icon} size={28} color={color} animation={animation} />
      </div>
      <div className="icon-widget-info">
        <span className="icon-widget-value">{value}</span>
        <span className="icon-widget-label">{label}</span>
      </div>
    </div>
  );
};

export const FloatingIcons = () => {
  const icons = [
    { Icon: require('react-icons/fi').FiUsers, color: '#FF7B1D', delay: 0, top: '10%', left: '5%' },
    { Icon: require('react-icons/fi').FiCalendar, color: '#76BC21', delay: 1, top: '20%', right: '10%' },
    { Icon: require('react-icons/fi').FiClock, color: '#3498DB', delay: 2, top: '50%', left: '8%' },
    { Icon: require('react-icons/fi').FiTrendingUp, color: '#9B59B6', delay: 0.5, top: '70%', right: '5%' },
    { Icon: require('react-icons/fi').FiStar, color: '#F1C40F', delay: 1.5, top: '80%', left: '15%' },
    { Icon: require('react-icons/fi').FiShield, color: '#E74C3C', delay: 3, top: '30%', right: '15%' },
  ];

  return (
    <div className="floating-icons-container">
      {icons.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <div
            key={i}
            className="floating-icon"
            style={{
              '--delay': `${item.delay}s`,
              top: item.top,
              left: item.left,
              right: item.right,
              color: item.color,
            }}
          >
            <IconComp size={32} />
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedIcon;
