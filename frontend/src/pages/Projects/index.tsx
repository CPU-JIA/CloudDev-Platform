import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Result, Button } from 'antd';
import { ProjectOutlined } from '@ant-design/icons';

import { setBreadcrumbs, setPageTitle } from '../../store/slices/uiSlice';

const Projects: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('项目管理'));
    dispatch(setBreadcrumbs([
      { key: 'projects', title: '项目管理' }
    ]));
  }, [dispatch]);

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        icon={<ProjectOutlined style={{ color: '#1890ff' }} />}
        title="项目管理功能开发中"
        subTitle="项目管理和团队协作功能正在开发中，敬请期待！"
        extra={[
          <Button type="primary" key="dashboard" onClick={() => window.history.back()}>
            返回上页
          </Button>,
          <Button key="ide" onClick={() => window.location.href = '/ide'}>
            进入IDE
          </Button>,
        ]}
      />
    </div>
  );
};

export default Projects;