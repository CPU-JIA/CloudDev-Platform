import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Button,
  Typography,
  Timeline,
  Space,
  Badge,
  Table,
  Tabs,
  Calendar,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ProjectOutlined,
  TeamOutlined,
  CodeOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  CalendarOutlined,
  GitlabOutlined,
  PullRequestOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  contributions: number;
}

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  assigneeAvatar?: string;
  dueDate: string;
  labels: string[];
  createdAt: string;
}

interface ProjectActivity {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'deploy' | 'comment' | 'merge';
  title: string;
  description: string;
  user: string;
  userAvatar?: string;
  timestamp: string;
  metadata?: any;
}

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalCommits: number;
  activeBranches: number;
  openPullRequests: number;
  codeLines: number;
  testCoverage: number;
  buildSuccess: number;
}

interface ProjectDashboardProps {
  projectId: string;
}

/**
 * 项目仪表板组件
 * 提供项目概览和关键指标
 */
const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // 模拟数据
  const [stats] = useState<ProjectStats>({
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 34,
    overdueTasks: 8,
    totalCommits: 1247,
    activeBranches: 12,
    openPullRequests: 7,
    codeLines: 45678,
    testCoverage: 87.5,
    buildSuccess: 94.2,
  });

  const [members] = useState<ProjectMember[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/32/4CAF50/ffffff?text=JD',
      role: 'owner',
      status: 'online',
      lastActive: '刚刚',
      contributions: 234,
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://via.placeholder.com/32/2196F3/ffffff?text=JS',
      role: 'admin',
      status: 'online',
      lastActive: '5分钟前',
      contributions: 189,
    },
    {
      id: '3',
      name: 'Bob Wilson',
      avatar: 'https://via.placeholder.com/32/FF9800/ffffff?text=BW',
      role: 'developer',
      status: 'away',
      lastActive: '1小时前',
      contributions: 156,
    },
    {
      id: '4',
      name: 'Alice Chen',
      role: 'developer',
      status: 'offline',
      lastActive: '昨天',
      contributions: 98,
    },
  ]);

  const [tasks] = useState<ProjectTask[]>([
    {
      id: '1',
      title: '实现用户认证功能',
      description: '完成JWT认证和权限管理',
      status: 'in_progress',
      priority: 'high',
      assignee: 'John Doe',
      assigneeAvatar: 'https://via.placeholder.com/24/4CAF50/ffffff?text=JD',
      dueDate: '2024-01-20',
      labels: ['backend', 'security'],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: '优化前端性能',
      description: '减少页面加载时间，优化组件渲染',
      status: 'review',
      priority: 'medium',
      assignee: 'Jane Smith',
      assigneeAvatar: 'https://via.placeholder.com/24/2196F3/ffffff?text=JS',
      dueDate: '2024-01-18',
      labels: ['frontend', 'performance'],
      createdAt: '2024-01-12',
    },
    {
      id: '3',
      title: '修复文件上传bug',
      description: '大文件上传失败问题',
      status: 'todo',
      priority: 'high',
      assignee: 'Bob Wilson',
      assigneeAvatar: 'https://via.placeholder.com/24/FF9800/ffffff?text=BW',
      dueDate: '2024-01-17',
      labels: ['bug', 'backend'],
      createdAt: '2024-01-16',
    },
  ]);

  const [activities] = useState<ProjectActivity[]>([
    {
      id: '1',
      type: 'commit',
      title: '提交了新代码',
      description: 'feat: add user authentication system',
      user: 'John Doe',
      userAvatar: 'https://via.placeholder.com/24/4CAF50/ffffff?text=JD',
      timestamp: '10分钟前',
    },
    {
      id: '2',
      type: 'pr',
      title: '创建了Pull Request',
      description: 'Fix performance issues in dashboard component',
      user: 'Jane Smith',
      userAvatar: 'https://via.placeholder.com/24/2196F3/ffffff?text=JS',
      timestamp: '1小时前',
    },
    {
      id: '3',
      type: 'issue',
      title: '报告了新问题',
      description: 'File upload fails for large files',
      user: 'Alice Chen',
      timestamp: '2小时前',
    },
    {
      id: '4',
      type: 'deploy',
      title: '部署到生产环境',
      description: 'v1.2.0 released successfully',
      user: 'System',
      timestamp: '4小时前',
    },
    {
      id: '5',
      type: 'merge',
      title: '合并了分支',
      description: 'Merged feature/authentication into main',
      user: 'John Doe',
      userAvatar: 'https://via.placeholder.com/24/4CAF50/ffffff?text=JD',
      timestamp: '昨天',
    },
  ]);

  /**
   * 获取状态颜色
   */
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'todo': return 'default';
      case 'in_progress': return 'processing';
      case 'review': return 'warning';
      case 'done': return 'success';
      default: return 'default';
    }
  }, []);

  /**
   * 获取优先级颜色
   */
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  }, []);

  /**
   * 获取用户状态颜色
   */
  const getUserStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'away': return '#faad14';
      case 'offline': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  }, []);

  /**
   * 获取活动图标
   */
  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'commit': return <GitlabOutlined className="text-blue-500" />;
      case 'pr': return <PullRequestOutlined className="text-green-500" />;
      case 'issue': return <BugOutlined className="text-red-500" />;
      case 'deploy': return <TrophyOutlined className="text-purple-500" />;
      case 'comment': return <MessageOutlined className="text-gray-500" />;
      case 'merge': return <CheckCircleOutlined className="text-green-600" />;
      default: return <UserOutlined className="text-gray-500" />;
    }
  }, []);

  /**
   * 渲染项目概览
   */
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 关键指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务"
              value={stats.totalTasks}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期任务"
              value={stats.overdueTasks}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 进度图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="任务完成进度">
            <div className="space-y-4">
              <div>
                <Text>整体进度</Text>
                <Progress 
                  percent={Math.round((stats.completedTasks / stats.totalTasks) * 100)}
                  status="active"
                />
              </div>
              <div>
                <Text>测试覆盖率</Text>
                <Progress 
                  percent={stats.testCoverage}
                  strokeColor="#52c41a"
                />
              </div>
              <div>
                <Text>构建成功率</Text>
                <Progress 
                  percent={stats.buildSuccess}
                  strokeColor="#1890ff"
                />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="代码统计">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="代码行数"
                  value={stats.codeLines}
                  prefix={<CodeOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总提交数"
                  value={stats.totalCommits}
                  prefix={<GitlabOutlined />}
                />
              </Col>
            </Row>
            
            <Row gutter={16} className="mt-4">
              <Col span={12}>
                <Statistic
                  title="活跃分支"
                  value={stats.activeBranches}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="待审PR"
                  value={stats.openPullRequests}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 最近活动和待办任务 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近活动" extra={<Button type="link">查看全部</Button>}>
            <Timeline>
              {activities.slice(0, 5).map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  dot={getActivityIcon(activity.type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {activity.userAvatar && (
                          <Avatar size={20} src={activity.userAvatar} />
                        )}
                        <Text strong>{activity.user}</Text>
                        <Text type="secondary">{activity.title}</Text>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </div>
                    </div>
                    <Text type="secondary" className="text-xs whitespace-nowrap ml-2">
                      {activity.timestamp}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="近期任务" extra={<Button type="link">查看全部</Button>}>
            <List
              dataSource={tasks}
              renderItem={(task) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Text strong className="truncate">{task.title}</Text>
                        <Tag color={getStatusColor(task.status)}>
                          {task.status}
                        </Tag>
                        <Tag color={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Tag>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.assigneeAvatar && (
                          <Avatar size={20} src={task.assigneeAvatar} />
                        )}
                        <Text type="secondary" className="text-sm">
                          {task.assignee}
                        </Text>
                      </div>
                      <Text type="secondary" className="text-sm">
                        {task.dueDate}
                      </Text>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.labels.map(label => (
                        <Tag key={label} size="small">{label}</Tag>
                      ))}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  /**
   * 渲染团队成员
   */
  const renderTeamMembers = () => (
    <Card title="团队成员" extra={<Button type="primary">邀请成员</Button>}>
      <List
        dataSource={members}
        renderItem={(member) => (
          <List.Item
            actions={[
              <Button type="link" size="small">编辑</Button>,
              <Button type="link" size="small" danger>移除</Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge 
                  dot 
                  color={getUserStatusColor(member.status)}
                  offset={[-4, 4]}
                >
                  <Avatar 
                    size={40}
                    src={member.avatar} 
                    icon={<UserOutlined />}
                  />
                </Badge>
              }
              title={
                <div className="flex items-center space-x-2">
                  <span>{member.name}</span>
                  <Tag color="blue">{member.role}</Tag>
                </div>
              }
              description={
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    最后活跃: {member.lastActive}
                  </div>
                  <div className="text-sm">
                    贡献: {member.contributions} 次提交
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  /**
   * 渲染任务看板
   */
  const renderTaskBoard = () => {
    const taskColumns: ColumnsType<ProjectTask> = [
      {
        title: '任务',
        dataIndex: 'title',
        key: 'title',
        render: (title: string, record: ProjectTask) => (
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-500 mt-1">{record.description}</div>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>{status}</Tag>
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        render: (priority: string) => (
          <Tag color={getPriorityColor(priority)}>{priority}</Tag>
        ),
      },
      {
        title: '负责人',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 120,
        render: (assignee: string, record: ProjectTask) => (
          <div className="flex items-center space-x-2">
            {record.assigneeAvatar && (
              <Avatar size={24} src={record.assigneeAvatar} />
            )}
            <span className="text-sm">{assignee}</span>
          </div>
        ),
      },
      {
        title: '截止日期',
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 100,
      },
    ];

    return (
      <Card title="任务管理" extra={<Button type="primary">创建任务</Button>}>
        <Table
          columns={taskColumns}
          dataSource={tasks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 项目信息头部 */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar size={48} icon={<ProjectOutlined />} />
            <div>
              <Title level={3} className="mb-0">CloudDev Platform</Title>
              <Text type="secondary">云端开发协作平台项目</Text>
            </div>
          </div>
          
          <Space>
            <Button icon={<TeamOutlined />}>
              邀请成员
            </Button>
            <Button type="primary" icon={<SettingOutlined />}>
              项目设置
            </Button>
          </Space>
        </div>
      </Card>

      {/* 快速提醒 */}
      {stats.overdueTasks > 0 && (
        <Alert
          message={`您有 ${stats.overdueTasks} 个逾期任务需要处理`}
          type="warning"
          showIcon
          action={
            <Button size="small" type="text">
              查看详情
            </Button>
          }
          closable
        />
      )}

      {/* 主要内容标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="项目概览" key="overview">
          {renderOverview()}
        </TabPane>
        
        <TabPane tab="团队成员" key="members">
          {renderTeamMembers()}
        </TabPane>
        
        <TabPane tab="任务管理" key="tasks">
          {renderTaskBoard()}
        </TabPane>
        
        <TabPane tab="项目日历" key="calendar">
          <Card title="项目日程">
            <Calendar />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;