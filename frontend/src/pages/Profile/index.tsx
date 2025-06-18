import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Result, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { setBreadcrumbs, setPageTitle } from '../../store/slices/uiSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('个人资料'));
    dispatch(setBreadcrumbs([
      { key: 'profile', title: '个人资料' }
    ]));
  }, [dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        icon={<UserOutlined style={{ color: '#1890ff' }} />}
        title="个人资料页面开发中"
        subTitle="用户个人资料管理功能正在开发中，敬请期待！"
        extra={[
          <Button type="primary" key="dashboard" onClick={() => window.history.back()}>
            返回上页
          </Button>,
          <Button key="settings" onClick={() => window.location.href = '/settings'}>
            系统设置
          </Button>,
        ]}
      />
    </div>
  );
};

export default Profile;