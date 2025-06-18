import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Result, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

import { setBreadcrumbs, setPageTitle } from '../../store/slices/uiSlice';

const Settings: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('设置'));
    dispatch(setBreadcrumbs([
      { key: 'settings', title: '设置' }
    ]));
  }, [dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        icon={<SettingOutlined style={{ color: '#1890ff' }} />}
        title="设置页面开发中"
        subTitle="系统设置和个人偏好配置功能正在开发中，敬请期待！"
        extra={[
          <Button type="primary" key="dashboard" onClick={() => window.history.back()}>
            返回上页
          </Button>,
          <Button key="profile" onClick={() => window.location.href = '/profile'}>
            个人资料
          </Button>,
        ]}
      />
    </div>
  );
};

export default Settings;