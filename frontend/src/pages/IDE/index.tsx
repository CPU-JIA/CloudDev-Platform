import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Result, Button } from 'antd';
import { CodeOutlined, ToolOutlined } from '@ant-design/icons';

import { setBreadcrumbs, setPageTitle } from '../../store/slices/uiSlice';

const IDE: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('IDE工作区'));
    dispatch(setBreadcrumbs([
      { key: 'ide', title: 'IDE工作区' }
    ]));
  }, [dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        icon={<CodeOutlined style={{ color: '#1890ff' }} />}
        title="IDE工作区开发中"
        subTitle="云端集成开发环境正在开发中，敬请期待！"
        extra={[
          <Button type="primary" key="dashboard" onClick={() => window.history.back()}>
            返回上页
          </Button>,
          <Button key="projects" onClick={() => window.location.href = '/projects'}>
            查看项目
          </Button>,
        ]}
      />
    </div>
  );
};

export default IDE;