import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Alert,
  Timeline,
  Typography,
  Space,
  Tooltip,
  Badge,
  Tabs,
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DashboardOutlined,
  ServerOutlined,
  DatabaseOutlined,
  CloudOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface SystemMetrics {
  cpu: {
    usage: number;
    trend: number[];
    cores: number;
  };
  memory: {
    usage: number;
    total: number;
    used: number;
    trend: number[];
  };
  disk: {
    usage: number;
    total: number;
    used: number;
    iops: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
  services: {
    total: number;
    running: number;
    stopped: number;
    error: number;
  };
}

interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  service: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'acknowledged';
  acknowledgedBy?: string;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  uptime: string;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  responseTime: number;
  lastRestart: string;
}

/**
 * 系统监控组件
 * 提供实时系统监控和告警管理
 */
const SystemMonitor: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // 模拟数据
  const [metrics] = useState<SystemMetrics>({
    cpu: {
      usage: 67.5,
      trend: [45, 52, 48, 61, 58, 67, 72, 69, 65, 67],
      cores: 8,
    },
    memory: {
      usage: 78.3,
      total: 32,
      used: 25.1,
      trend: [65, 68, 72, 75, 77, 76, 78, 79, 77, 78],
    },
    disk: {
      usage: 45.2,
      total: 1000,
      used: 452,
      iops: 1247,
    },
    network: {
      inbound: 125.6,
      outbound: 89.4,
      latency: 12.5,
    },
    services: {
      total: 12,
      running: 10,
      stopped: 1,
      error: 1,
    },
  });

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      level: 'critical',
      title: 'MySQL数据库连接失败',
      description: '无法连接到主数据库服务器，服务可能受到影响',
      service: 'mysql-primary',
      timestamp: '2024-01-16 15:30:25',
      status: 'active',
    },
    {
      id: '2',
      level: 'warning',
      title: 'CPU使用率过高',
      description: 'Web服务器CPU使用率持续超过80%',
      service: 'web-server-01',
      timestamp: '2024-01-16 15:25:12',
      status: 'active',
    },
    {
      id: '3',
      level: 'warning',
      title: '内存使用率偏高',
      description: 'Redis缓存服务内存使用率达到85%',
      service: 'redis-cache',
      timestamp: '2024-01-16 15:20:08',
      status: 'acknowledged',
      acknowledgedBy: 'John Doe',
    },
    {
      id: '4',
      level: 'info',
      title: '定时任务执行完成',
      description: '数据备份任务已成功完成',
      service: 'backup-service',
      timestamp: '2024-01-16 15:00:00',
      status: 'resolved',
    },
  ]);

  const [services] = useState<ServiceStatus[]>([
    {
      name: 'Auth Service',
      status: 'running',
      uptime: '15天 3小时',
      cpu: 12.5,
      memory: 256,
      requests: 1250,
      errors: 2,
      responseTime: 45,
      lastRestart: '2024-01-01 10:00:00',
    },
    {
      name: 'IDE Service',
      status: 'running',
      uptime: '7天 12小时',
      cpu: 35.8,
      memory: 512,
      requests: 890,
      errors: 0,
      responseTime: 78,
      lastRestart: '2024-01-09 08:30:00',
    },
    {
      name: 'CI/CD Service',
      status: 'running',
      uptime: '3天 6小时',
      cpu: 25.2,
      memory: 384,
      requests: 450,
      errors: 1,
      responseTime: 125,
      lastRestart: '2024-01-13 14:15:00',
    },
    {
      name: 'Project Service',
      status: 'running',
      uptime: '12天 8小时',
      cpu: 18.7,
      memory: 298,
      requests: 670,
      errors: 0,
      responseTime: 62,
      lastRestart: '2024-01-04 16:45:00',
    },
    {
      name: 'File Service',
      status: 'error',
      uptime: '0分钟',
      cpu: 0,
      memory: 0,
      requests: 0,
      errors: 15,
      responseTime: 0,
      lastRestart: '2024-01-16 15:30:00',
    },
    {
      name: 'Notification Service',
      status: 'stopped',
      uptime: '0分钟',
      cpu: 0,
      memory: 0,
      requests: 0,
      errors: 0,
      responseTime: 0,
      lastRestart: '2024-01-16 14:00:00',
    },
  ]);

  // 性能数据
  const performanceData = [
    { time: '14:00', cpu: 45, memory: 65, requests: 120 },
    { time: '14:15', cpu: 52, memory: 68, requests: 150 },
    { time: '14:30', cpu: 48, memory: 72, requests: 180 },
    { time: '14:45', cpu: 61, memory: 75, requests: 200 },
    { time: '15:00', cpu: 58, memory: 77, requests: 165 },
    { time: '15:15', cpu: 67, memory: 76, requests: 190 },
    { time: '15:30', cpu: 72, memory: 78, requests: 220 },
  ];

  const errorData = [
    { service: 'Auth', errors: 2, color: '#ff4d4f' },
    { service: 'IDE', errors: 0, color: '#52c41a' },
    { service: 'CI/CD', errors: 1, color: '#faad14' },
    { service: 'Project', errors: 0, color: '#52c41a' },
    { service: 'File', errors: 15, color: '#ff4d4f' },
    { service: 'Notification', errors: 0, color: '#52c41a' },
  ];

  /**
   * 获取告警级别颜色
   */
  const getAlertLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  }, []);

  /**
   * 获取告警状态颜色
   */
  const getAlertStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'red';
      case 'acknowledged': return 'orange';
      case 'resolved': return 'green';
      default: return 'default';
    }
  }, []);

  /**
   * 获取服务状态颜色
   */
  const getServiceStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'default';
      case 'error': return 'error';
      case 'starting': return 'processing';
      default: return 'default';
    }
  }, []);

  /**
   * 格式化字节数
   */
  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * 渲染系统概览
   */
  const renderSystemOverview = () => (
    <div className="space-y-6">
      {/* 关键指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={metrics.cpu.usage}
              suffix="%"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ 
                color: metrics.cpu.usage > 80 ? '#ff4d4f' : 
                       metrics.cpu.usage > 60 ? '#faad14' : '#52c41a'
              }}
            />
            <Progress 
              percent={metrics.cpu.usage} 
              size="small" 
              strokeColor={
                metrics.cpu.usage > 80 ? '#ff4d4f' : 
                metrics.cpu.usage > 60 ? '#faad14' : '#52c41a'
              }
              className="mt-2"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={metrics.memory.usage}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ 
                color: metrics.memory.usage > 85 ? '#ff4d4f' : 
                       metrics.memory.usage > 70 ? '#faad14' : '#52c41a'
              }}
            />
            <div className="text-xs text-gray-500 mt-2">
              {formatBytes(metrics.memory.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024 * 1024)}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="磁盘使用率"
              value={metrics.disk.usage}
              suffix="%"
              prefix={<ServerOutlined />}
              valueStyle={{ 
                color: metrics.disk.usage > 90 ? '#ff4d4f' : 
                       metrics.disk.usage > 75 ? '#faad14' : '#52c41a'
              }}
            />
            <div className="text-xs text-gray-500 mt-2">
              IOPS: {metrics.disk.iops}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="服务状态"
              value={metrics.services.running}
              suffix={`/ ${metrics.services.total}`}
              prefix={<CloudOutlined />}
              valueStyle={{ 
                color: metrics.services.error > 0 ? '#ff4d4f' : '#52c41a'
              }}
            />
            <div className="text-xs text-gray-500 mt-2">
              {metrics.services.error} 错误, {metrics.services.stopped} 停止
            </div>
          </Card>
        </Col>
      </Row>

      {/* 性能图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="性能趋势" extra={
            <Space>
              <Select value={timeRange} onChange={setTimeRange} size="small">
                <Option value="1h">最近1小时</Option>
                <Option value="6h">最近6小时</Option>
                <Option value="24h">最近24小时</Option>
                <Option value="7d">最近7天</Option>
              </Select>
            </Space>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="cpu" stroke="#1890ff" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#52c41a" name="内存 %" />
                <Line type="monotone" dataKey="requests" stroke="#faad14" name="请求数" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="错误分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="errors"
                >
                  {errorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {errorData.map((item) => (
                <div key={item.service} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.service}</span>
                  </div>
                  <span className="text-sm font-medium">{item.errors}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 活跃告警 */}
      {alerts.filter(alert => alert.status === 'active').length > 0 && (
        <Card title="活跃告警" extra={
          <Button type="primary" size="small">
            查看全部告警
          </Button>
        }>
          <div className="space-y-3">
            {alerts
              .filter(alert => alert.status === 'active')
              .slice(0, 3)
              .map((alert) => (
                <Alert
                  key={alert.id}
                  type={alert.level === 'critical' ? 'error' : 'warning'}
                  message={alert.title}
                  description={
                    <div className="flex justify-between items-center">
                      <span>{alert.description}</span>
                      <div className="flex items-center space-x-2">
                        <Tag>{alert.service}</Tag>
                        <Text type="secondary" className="text-xs">
                          {alert.timestamp}
                        </Text>
                      </div>
                    </div>
                  }
                  showIcon
                />
              ))}
          </div>
        </Card>
      )}
    </div>
  );

  /**
   * 渲染告警管理
   */
  const renderAlertManagement = () => {
    const alertColumns = [
      {
        title: '级别',
        dataIndex: 'level',
        key: 'level',
        width: 80,
        render: (level: string) => (
          <Tag color={getAlertLevelColor(level)}>
            {level.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: '告警信息',
        key: 'alert',
        render: (record: Alert) => (
          <div>
            <div className="font-medium">{record.title}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        ),
      },
      {
        title: '服务',
        dataIndex: 'service',
        key: 'service',
        width: 120,
        render: (service: string) => <Tag>{service}</Tag>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={getAlertStatusColor(status)}>
            {status === 'active' ? '活跃' : 
             status === 'acknowledged' ? '已确认' : '已解决'}
          </Tag>
        ),
      },
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 150,
      },
      {
        title: '操作',
        key: 'actions',
        width: 120,
        render: (record: Alert) => (
          <Space size="small">
            {record.status === 'active' && (
              <Button size="small" type="link">
                确认
              </Button>
            )}
            <Button size="small" type="link">
              查看
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Card title="告警管理" extra={
        <Space>
          <Select defaultValue="all" size="small">
            <Option value="all">全部</Option>
            <Option value="active">活跃</Option>
            <Option value="acknowledged">已确认</Option>
            <Option value="resolved">已解决</Option>
          </Select>
          <RangePicker size="small" />
        </Space>
      }>
        <Table
          columns={alertColumns}
          dataSource={alerts}
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

  /**
   * 渲染服务监控
   */
  const renderServiceMonitoring = () => {
    const serviceColumns = [
      {
        title: '服务名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Badge 
            status={getServiceStatusColor(status)} 
            text={
              status === 'running' ? '运行中' :
              status === 'stopped' ? '已停止' :
              status === 'error' ? '错误' : '启动中'
            }
          />
        ),
      },
      {
        title: '运行时间',
        dataIndex: 'uptime',
        key: 'uptime',
        width: 120,
      },
      {
        title: 'CPU',
        dataIndex: 'cpu',
        key: 'cpu',
        width: 80,
        render: (cpu: number) => `${cpu}%`,
      },
      {
        title: '内存',
        dataIndex: 'memory',
        key: 'memory',
        width: 80,
        render: (memory: number) => `${memory}MB`,
      },
      {
        title: '请求数',
        dataIndex: 'requests',
        key: 'requests',
        width: 80,
      },
      {
        title: '错误数',
        dataIndex: 'errors',
        key: 'errors',
        width: 80,
        render: (errors: number) => (
          <span className={errors > 0 ? 'text-red-500' : ''}>
            {errors}
          </span>
        ),
      },
      {
        title: '响应时间',
        dataIndex: 'responseTime',
        key: 'responseTime',
        width: 100,
        render: (time: number) => `${time}ms`,
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
        render: (record: ServiceStatus) => (
          <Space size="small">
            {record.status === 'stopped' && (
              <Button size="small" type="primary">
                启动
              </Button>
            )}
            {record.status === 'running' && (
              <Button size="small">
                重启
              </Button>
            )}
            <Button size="small" icon={<EyeOutlined />}>
              日志
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Card title="服务监控">
        <Table
          columns={serviceColumns}
          dataSource={services}
          rowKey="name"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 控制栏 */}
      <Card>
        <div className="flex items-center justify-between">
          <Title level={3} className="mb-0">系统监控</Title>
          <Space>
            <span className="text-sm text-gray-500">自动刷新:</span>
            <Select 
              value={refreshInterval} 
              onChange={setRefreshInterval}
              size="small"
            >
              <Option value={15}>15秒</Option>
              <Option value={30}>30秒</Option>
              <Option value={60}>1分钟</Option>
              <Option value={300}>5分钟</Option>
            </Select>
            <Button
              type={autoRefresh ? 'primary' : 'default'}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '暂停' : '开始'}
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主要内容 */}
      <Tabs defaultActiveKey="overview">
        <TabPane tab="系统概览" key="overview">
          {renderSystemOverview()}
        </TabPane>
        
        <TabPane tab="告警管理" key="alerts">
          {renderAlertManagement()}
        </TabPane>
        
        <TabPane tab="服务监控" key="services">
          {renderServiceMonitoring()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemMonitor;