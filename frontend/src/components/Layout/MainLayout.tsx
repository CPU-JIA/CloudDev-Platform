import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Badge,
  Typography,
  Tooltip,
  Breadcrumb,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CodeOutlined,
  ProjectOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';

import { AppDispatch } from '../../store';
import { logout, selectUser } from '../../store/slices/authSlice';
import {
  toggleSidebar,
  selectSidebarCollapsed,
  selectNotificationCount,
  openDrawer,
  selectBreadcrumbs,
} from '../../store/slices/uiSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  children?: MenuItem[];
}

// 菜单配置
const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
    path: '/dashboard',
  },
  {
    key: 'ide',
    icon: <CodeOutlined />,
    label: 'IDE工作区',
    path: '/ide',
  },
  {
    key: 'projects',
    icon: <ProjectOutlined />,
    label: '项目管理',
    path: '/projects',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
    path: '/settings',
  },
];

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector(selectUser);
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const notificationCount = useSelector(selectNotificationCount);
  const breadcrumbs = useSelector(selectBreadcrumbs);
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedItem = menuItems.find(item => 
      currentPath.startsWith(item.path) || 
      (item.children && item.children.some(child => currentPath.startsWith(child.path)))
    );
    
    if (matchedItem) {
      setSelectedKeys([matchedItem.key]);
    }
  }, [location.pathname]);

  /**
   * 处理菜单点击
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem) {
      navigate(menuItem.path);
    }
  };

  /**
   * 处理用户菜单点击
   */
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        dispatch(logout());
        break;
      default:
        break;
    }
  };

  /**
   * 处理通知点击
   */
  const handleNotificationClick = () => {
    dispatch(openDrawer('notifications'));
  };

  /**
   * 处理搜索点击
   */
  const handleSearchClick = () => {
    dispatch(openDrawer('search'));
  };

  /**
   * 处理帮助点击
   */
  const handleHelpClick = () => {
    dispatch(openDrawer('help'));
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  // 渲染面包屑
  const renderBreadcrumb = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) {
      return null;
    }

    return (
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        {breadcrumbs.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.path ? (
              <a onClick={() => navigate(item.path!)}>{item.title}</a>
            ) : (
              item.title
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        theme="dark"
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          padding: sidebarCollapsed ? 0 : '0 24px',
          background: 'rgba(255, 255, 255, 0.1)',
        }}>
          {sidebarCollapsed ? (
            <Text strong style={{ color: '#fff', fontSize: 18 }}>
              CD
            </Text>
          ) : (
            <Text strong style={{ color: '#fff', fontSize: 16 }}>
              CloudDev Platform
            </Text>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children?.map(child => ({
              key: child.key,
              icon: child.icon,
              label: child.label,
            })),
          }))}
        />
      </Sider>

      {/* 主内容区域 */}
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        {/* 顶部导航 */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}>
          {/* 左侧 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(toggleSidebar())}
              style={{ fontSize: 16, width: 40, height: 40 }}
            />
          </div>

          {/* 右侧 */}
          <Space size="middle">
            {/* 搜索 */}
            <Tooltip title="搜索">
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={handleSearchClick}
                style={{ fontSize: 16 }}
              />
            </Tooltip>

            {/* 通知 */}
            <Tooltip title="通知">
              <Badge count={notificationCount} offset={[10, 0]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={handleNotificationClick}
                  style={{ fontSize: 16 }}
                />
              </Badge>
            </Tooltip>

            {/* 帮助 */}
            <Tooltip title="帮助">
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                onClick={handleHelpClick}
                style={{ fontSize: 16 }}
              />
            </Tooltip>

            {/* 用户菜单 */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size="default"
                />
                <Text strong>{user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 */}
        <Content style={{
          margin: 0,
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* 面包屑 */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div style={{
              background: '#fff',
              padding: '0 24px',
              borderBottom: '1px solid #f0f0f0',
            }}>
              {renderBreadcrumb()}
            </div>
          )}

          {/* 页面内容 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;