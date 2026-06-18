import { usePermission } from '../../context/AuthContext';

const PermissionGuard = ({ module, action, children, fallback = null }) => {
  const { hasPermission } = usePermission();
  return hasPermission(module, action) ? children : fallback;
};

export const ModuleGuard = ({ module, children, fallback = null }) => {
  const { hasModuleAccess } = usePermission();
  return hasModuleAccess(module) ? children : fallback;
};

export default PermissionGuard;