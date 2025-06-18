import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  List,
  Avatar,
  Space,
  Progress,
  Tag,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  ProjectOutlined,
  CodeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

import { selectUser } from '../store/slices/authSlice';
import { setBreadcrumbs, setPageTitle } from '../store/slices/uiSlice';

const { Title, Text, Paragraph } = Typography;

// 模拟数据
const mockStats = {
  totalProjects: 12,
  activeWorkspaces: 3,
  teamMembers: 8,
  totalCommits: 156,
  projectsChange: 2,
  workspacesChange: 1,
  membersChange: 0,
  commitsChange: 24,
};

const mockRecentProjects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: '基于React和Node.js的电商平台',
    status: 'active',
    progress: 75,
    lastActivity: '2 小时前',
    members: 5,
    avatar: 'https://via.placeholder.com/40/1890ff/ffffff?text=EP',
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'React Native移动银行应用',
    status: 'in_progress',
    progress: 45,
    lastActivity: '1 天前',
    members: 3,
    avatar: 'https://via.placeholder.com/40/52c41a/ffffff?text=MB',
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Vue.js数据分析仪表盘',
    status: 'planning',
    progress: 20,
    lastActivity: '3 天前',
    members: 4,
    avatar: 'https://via.placeholder.com/40/faad14/ffffff?text=DA',
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'commit',
    user: 'John Doe',
    action: '提交了代码',
    target: 'E-commerce Platform',
    time: '30 分钟前',
    avatar: 'https://via.placeholder.com/32/1890ff/ffffff?text=JD',
  },
  {
    id: '2',
    type: 'workspace',
    user: 'Jane Smith',
    action: '创建了工作空间',
    target: 'Mobile Banking App',
    time: '2 小时前',
    avatar: 'https://via.placeholder.com/32/52c41a/ffffff?text=JS',
  },
  {
    id: '3',
    type: 'review',
    user: 'Bob Wilson',
    action: '完成了代码审查',
    target: 'Data Analytics Dashboard',
    time: '4 小时前',
    avatar: 'https://via.placeholder.com/32/faad14/ffffff?text=BW',
  },
  {
    id: '4',
    type: 'merge',
    user: 'Alice Johnson',
    action: '合并了分支',
    target: 'E-commerce Platform',
    time: '1 天前',
    avatar: 'https://via.placeholder.com/32/f759ab/ffffff?text=AJ',
  },
];

/**
 * 仪表盘页面
 */
const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(setPageTitle('仪表盘'));
    dispatch(setBreadcrumbs([
      { key: 'dashboard', title: '仪表盘' }
    ]));
  }, [dispatch]);

  /**
   * 获取状态标签
   */
  const getStatusTag = (status: string) => {
    const statusMap = {
      active: { color: 'green', text: '进行中' },
      in_progress: { color: 'blue', text: '开发中' },
      planning: { color: 'orange', text: '规划中' },
      completed: { color: 'default', text: '已完成' },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.planning;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 获取活动图标
   */
  const getActivityIcon = (type: string) => {
    const iconMap = {
      commit: <CodeOutlined style={{ color: '#1890ff' }} />,
      workspace: <PlayCircleOutlined style={{ color: '#52c41a' }} />,
      review: <TeamOutlined style={{ color: '#faad14' }} />,
      merge: <ProjectOutlined style={{ color: '#f759ab' }} />,
    };
    
    return iconMap[type as keyof typeof iconMap] || <ClockCircleOutlined />;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 欢迎信息 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          欢迎回来，{user?.username}！
        </Title>
        <Paragraph type="secondary">
          这里是您的工作概览，查看项目进展和团队动态。
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={mockStats.totalProjects}
              prefix={<ProjectOutlined />}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +{mockStats.projectsChange}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃工作空间"
              value={mockStats.activeWorkspaces}
              prefix={<CodeOutlined />}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +{mockStats.workspacesChange}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={mockStats.teamMembers}
              prefix={<TeamOutlined />}
              suffix={
                mockStats.membersChange === 0 ? (
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>-</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#52c41a' }}>
                    <ArrowUpOutlined /> +{mockStats.membersChange}
                  </span>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本周提交"
              value={mockStats.totalCommits}
              prefix={<ClockCircleOutlined />}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +{mockStats.commitsChange}
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近项目 */}
        <Col xs={24} lg={14}>
          <Card
            title="最近项目"
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small">
                新建项目
              </Button>
            }
          >
            {mockRecentProjects.length === 0 ? (
              <Empty description="暂无项目" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={mockRecentProjects}
                renderItem={(project) => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看</Button>,
                      <Button type="link" size="small">编辑</Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={project.avatar} />}
                      title={
                        <Space>
                          {project.name}
                          {getStatusTag(project.status)}
                        </Space>
                      }
                      description={
                        <div>
                          <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 8 }}>
                            {project.description}
                          </Paragraph>
                          <Space split="|">
                            <Text type="secondary">{project.members} 成员</Text>
                            <Text type="secondary">{project.lastActivity}</Text>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              进度: {project.progress}%
                            </Text>
                            <Progress
                              percent={project.progress}
                              size="small"
                              showInfo={false}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={10}>
          <Card title="最近活动">
            {mockRecentActivities.length === 0 ? (
              <Empty description="暂无活动" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={mockRecentActivities}
                renderItem={(activity) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{ position: 'relative' }}>
                          <Avatar src={activity.avatar} size="small" />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              background: '#fff',
                              borderRadius: '50%',
                              padding: 2,
                              lineHeight: 1,
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                      }
                      title={
                        <Text style={{ fontSize: 13 }}>
                          <Text strong>{activity.user}</Text> {activity.action}{' '}
                          <Text code>{activity.target}</Text>
                        </Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {activity.time}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              size="large"
              style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div>创建项目</div>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="dashed"
              block
              icon={<CodeOutlined />}
              size="large"
              style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div>打开IDE</div>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="dashed"
              block
              icon={<TeamOutlined />}
              size="large"
              style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div>邀请成员</div>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="dashed"
              block
              icon={<ProjectOutlined />}
              size="large"
              style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div>项目模板</div>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;