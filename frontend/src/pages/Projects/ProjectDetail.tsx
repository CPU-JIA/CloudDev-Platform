import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Result, Button } from 'antd';
import { ProjectOutlined } from '@ant-design/icons';

import { setBreadcrumbs, setPageTitle } from '../../store/slices/uiSlice';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('项目详情'));
    dispatch(setBreadcrumbs([
      { key: 'projects', title: '项目管理', path: '/projects' },
      { key: 'project-detail', title: `项目 ${projectId}` }
    ]));
  }, [dispatch, projectId]);

  return (
    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        icon={<ProjectOutlined style={{ color: '#1890ff' }} />}
        title="项目详情页开发中"
        subTitle={`项目 ${projectId} 的详情页面正在开发中，敬请期待！`}
        extra={[
          <Button type="primary" key="projects" onClick={() => window.location.href = '/projects'}>
            返回项目列表
          </Button>,
          <Button key="dashboard" onClick={() => window.location.href = '/dashboard'}>
            回到仪表盘
          </Button>,
        ]}
      />
    </div>
  );
};

export default ProjectDetail;