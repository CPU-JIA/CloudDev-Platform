import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import { selectIsAuthenticated, selectIsLoading } from '../store/slices/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * 私有路由组件
 * 用于保护需要认证的路由
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // 如果正在加载认证状态，显示加载器
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="验证身份中..." />
      </div>
    );
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // TODO: 实现权限和角色检查
  // const user = useSelector(selectUser);
  // 
  // // 检查所需权限
  // if (requiredPermissions.length > 0) {
  //   const hasAllPermissions = requiredPermissions.every(permission =>
  //     user?.permissions?.includes(permission)
  //   );
  //   if (!hasAllPermissions) {
  //     return <Navigate to="/403" replace />;
  //   }
  // }
  // 
  // // 检查所需角色
  // if (requiredRoles.length > 0) {
  //   const hasRequiredRole = requiredRoles.some(role =>
  //     user?.roles?.includes(role)
  //   );
  //   if (!hasRequiredRole) {
  //     return <Navigate to="/403" replace />;
  //   }
  // }

  return <>{children}</>;
};

export default PrivateRoute;