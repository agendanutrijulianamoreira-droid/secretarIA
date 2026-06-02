export const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`glass-card ${className}`}
    style={{ padding: '24px', borderRadius: '24px', ...style }}
  >
    {children}
  </div>
);
