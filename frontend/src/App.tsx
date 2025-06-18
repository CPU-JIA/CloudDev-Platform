import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin, Alert } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from './store';
import { checkAuthStatus } from './store/slices/authSlice';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';

// 懒加载页面组件
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const IDE = React.lazy(() => import('./pages/IDE'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ProjectDetail = React.lazy(() => import('./pages/Projects/ProjectDetail'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const { Content } = Layout;

// 加载中组件
const LoadingSpinner: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#f5f5f5'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

// 错误回退组件
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <Alert
      message="应用加载失败"
      description={`错误信息: ${error.message}`}
      type="error"
      showIcon
      action={
        <button onClick={() => window.location.reload()}>
          重新加载
        </button>
      }
    />
  </div>
);

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 检查用户认证状态
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // 应用初始化加载中
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <div className="app">
        <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
              </Suspense>
            }
          />

          {/* 受保护的路由 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* 仪表盘 */}
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <Dashboard />
                </Suspense>
              }
            />

            {/* IDE工作区 */}
            <Route
              path="ide/:workspaceId?"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <IDE />
                </Suspense>
              }
            />

            {/* 项目管理 */}
            <Route
              path="projects"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <Projects />
                </Suspense>
              }
            />
            <Route
              path="projects/:projectId"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <ProjectDetail />
                </Suspense>
              }
            />

            {/* 用户设置 */}
            <Route
              path="settings"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <Settings />
                </Suspense>
              }
            />

            {/* 用户资料 */}
            <Route
              path="profile"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <Profile />
                </Suspense>
              }
            />

            {/* 404页面 */}
            <Route
              path="*"
              element={
                <Suspense fallback={<Spin size="large" />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>

          {/* 根路径重定向 */}
          <Route
            path="*"
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
};

export default App;