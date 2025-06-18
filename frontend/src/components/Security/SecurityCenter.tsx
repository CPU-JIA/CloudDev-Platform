import React, { useState, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Alert,
  Progress,
  Typography,
  Space,
  Tabs,
  List,
  Switch,
  Form,
  Input,
  Select,
  Modal,
  Timeline,
  Badge,
  Tooltip,
} from 'antd';
import {
  ShieldOutlined,
  WarningOutlined,
  SafetyOutlined,
  KeyOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ScanOutlined,
  BugOutlined,
  AuditOutlined,
  UserOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'dependency' | 'code' | 'config' | 'infrastructure';
  file?: string;
  line?: number;
  cwe?: string;
  cvss?: number;
  discoveredAt: string;
  status: 'open' | 'fixed' | 'ignored' | 'false_positive';
  assignee?: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data' | 'network' | 'compliance';
  enabled: boolean;
  severity: 'strict' | 'moderate' | 'flexible';
  rules: SecurityRule[];
  lastUpdated: string;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

interface AccessLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  location: string;
  status: 'success' | 'failed' | 'blocked';
  timestamp: string;
  risk: 'low' | 'medium' | 'high';
}

interface ComplianceCheck {
  id: string;
  standard: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  lastCheck: string;
  nextCheck: string;
  evidence?: string;
  remediation?: string;
}

/**
 * 安全中心组件
 * 提供安全监控、漏洞管理和合规检查
 */
const SecurityCenter: React.FC = () => {
  const [form] = Form.useForm();
  const [isPolicyModalVisible, setIsPolicyModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);

  // 模拟数据
  const [securityStats] = useState({
    vulnerabilities: {
      total: 23,
      critical: 2,
      high: 5,
      medium: 10,
      low: 6,
      fixed: 156,
    },
    compliance: {
      score: 87.5,
      passed: 35,
      failed: 5,
      total: 40,
    },
    accessControl: {
      activeUsers: 245,
      failedLogins: 12,
      blockedIPs: 8,
      mfaEnabled: 89.2,
    },
    dataProtection: {
      encrypted: 95.8,
      backup: 100,
      retention: 98.5,
      gdprCompliant: 92.3,
    },
  });

  const [vulnerabilities] = useState<SecurityVulnerability[]>([
    {
      id: '1',
      title: 'SQL注入漏洞',
      description: '用户输入未经充分验证，可能导致SQL注入攻击',
      severity: 'critical',
      type: 'code',
      file: 'src/services/userService.js',
      line: 45,
      cwe: 'CWE-89',
      cvss: 9.8,
      discoveredAt: '2024-01-16 10:30:00',
      status: 'open',
      assignee: 'John Doe',
    },
    {
      id: '2',
      title: '过时的依赖包',
      description: 'lodash版本存在原型污染漏洞',
      severity: 'high',
      type: 'dependency',
      cwe: 'CWE-1321',
      cvss: 7.5,
      discoveredAt: '2024-01-16 09:15:00',
      status: 'open',
      assignee: 'Jane Smith',
    },
    {
      id: '3',
      title: '敏感信息泄露',
      description: '日志中包含用户密码明文',
      severity: 'high',
      type: 'config',
      file: 'config/logging.yaml',
      line: 12,
      cwe: 'CWE-532',
      cvss: 7.2,
      discoveredAt: '2024-01-16 08:45:00',
      status: 'fixed',
      assignee: 'Bob Wilson',
    },
    {
      id: '4',
      title: '跨站脚本攻击',
      description: '用户输入未经转义直接输出到页面',
      severity: 'medium',
      type: 'code',
      file: 'src/components/UserProfile.tsx',
      line: 78,
      cwe: 'CWE-79',
      cvss: 6.1,
      discoveredAt: '2024-01-15 16:20:00',
      status: 'open',
      assignee: 'Alice Chen',
    },
  ]);

  const [accessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      userId: '123',
      username: 'john.doe',
      action: 'login',
      resource: '/auth/login',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: '北京, 中国',
      status: 'success',
      timestamp: '2024-01-16 15:30:25',
      risk: 'low',
    },
    {
      id: '2',
      userId: '456',
      username: 'suspicious.user',
      action: 'login_attempt',
      resource: '/auth/login',
      ip: '101.201.123.45',
      userAgent: 'curl/7.68.0',
      location: '未知',
      status: 'blocked',
      timestamp: '2024-01-16 15:25:12',
      risk: 'high',
    },
    {
      id: '3',
      userId: '789',
      username: 'jane.smith',
      action: 'file_download',
      resource: '/api/files/sensitive-data.xlsx',
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: '上海, 中国',
      status: 'success',
      timestamp: '2024-01-16 15:20:45',
      risk: 'medium',
    },
  ]);

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      id: '1',
      standard: 'GDPR',
      requirement: '数据处理同意机制',
      status: 'compliant',
      lastCheck: '2024-01-15',
      nextCheck: '2024-02-15',
      evidence: '用户同意机制已实现并记录',
    },
    {
      id: '2',
      standard: 'SOC 2',
      requirement: '访问控制管理',
      status: 'non_compliant',
      lastCheck: '2024-01-14',
      nextCheck: '2024-01-21',
      remediation: '需要实现基于角色的访问控制',
    },
    {
      id: '3',
      standard: 'ISO 27001',
      requirement: '信息安全策略',
      status: 'partial',
      lastCheck: '2024-01-13',
      nextCheck: '2024-02-13',
      remediation: '策略文档需要更新',
    },
    {
      id: '4',
      standard: 'PCI DSS',
      requirement: '支付数据加密',
      status: 'compliant',
      lastCheck: '2024-01-12',
      nextCheck: '2024-02-12',
      evidence: 'AES-256加密已实施',
    },
  ]);

  /**
   * 获取严重性颜色
   */
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'default';
    }
  }, []);

  /**
   * 获取状态颜色
   */
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'open': return 'red';
      case 'fixed': return 'green';
      case 'ignored': return 'gray';
      case 'false_positive': return 'blue';
      case 'compliant': return 'green';
      case 'non_compliant': return 'red';
      case 'partial': return 'orange';
      case 'not_applicable': return 'gray';
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'blocked': return 'orange';
      default: return 'default';
    }
  }, []);

  /**
   * 获取风险等级颜色
   */
  const getRiskColor = useCallback((risk: string) => {
    switch (risk) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  }, []);

  /**
   * 渲染安全概览
   */
  const renderSecurityOverview = () => (
    <div className="space-y-6">
      {/* 安全指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="安全漏洞"
              value={securityStats.vulnerabilities.total}
              prefix={<BugOutlined />}
              valueStyle={{ 
                color: securityStats.vulnerabilities.critical > 0 ? '#ff4d4f' : '#52c41a'
              }}
            />
            <div className="text-xs text-gray-500 mt-2">
              {securityStats.vulnerabilities.critical} 严重, {securityStats.vulnerabilities.high} 高危
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="合规得分"
              value={securityStats.compliance.score}
              suffix="%"
              prefix={<SafetyOutlined />}
              valueStyle={{ 
                color: securityStats.compliance.score >= 90 ? '#52c41a' : 
                       securityStats.compliance.score >= 75 ? '#faad14' : '#ff4d4f'
              }}
            />
            <Progress
              percent={securityStats.compliance.score}
              size="small"
              strokeColor={
                securityStats.compliance.score >= 90 ? '#52c41a' : 
                securityStats.compliance.score >= 75 ? '#faad14' : '#ff4d4f'
              }
              className="mt-2"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="MFA启用率"
              value={securityStats.accessControl.mfaEnabled}
              suffix="%"
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              {securityStats.accessControl.failedLogins} 次登录失败
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="数据加密率"
              value={securityStats.dataProtection.encrypted}
              suffix="%"
              prefix={<LockOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="text-xs text-gray-500 mt-2">
              GDPR合规: {securityStats.dataProtection.gdprCompliant}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 安全警报 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最新安全威胁">
            <div className="space-y-3">
              {vulnerabilities
                .filter(v => v.status === 'open' && (v.severity === 'critical' || v.severity === 'high'))
                .slice(0, 3)
                .map((vuln) => (
                  <Alert
                    key={vuln.id}
                    type={vuln.severity === 'critical' ? 'error' : 'warning'}
                    message={vuln.title}
                    description={
                      <div className="flex justify-between items-center">
                        <span>{vuln.description}</span>
                        <div className="flex items-center space-x-2">
                          <Tag color={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Tag>
                          <Text type="secondary" className="text-xs">
                            CVSS: {vuln.cvss}
                          </Text>
                        </div>
                      </div>
                    }
                    showIcon
                    action={
                      <Button size="small" type="primary">
                        查看详情
                      </Button>
                    }
                  />
                ))}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="安全趋势">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text>漏洞修复进度</Text>
                  <Text strong>
                    {Math.round((securityStats.vulnerabilities.fixed / 
                    (securityStats.vulnerabilities.fixed + securityStats.vulnerabilities.total)) * 100)}%
                  </Text>
                </div>
                <Progress 
                  percent={Math.round((securityStats.vulnerabilities.fixed / 
                    (securityStats.vulnerabilities.fixed + securityStats.vulnerabilities.total)) * 100)}
                  strokeColor="#52c41a"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text>合规检查通过率</Text>
                  <Text strong>
                    {Math.round((securityStats.compliance.passed / securityStats.compliance.total) * 100)}%
                  </Text>
                </div>
                <Progress 
                  percent={Math.round((securityStats.compliance.passed / securityStats.compliance.total) * 100)}
                  strokeColor="#1890ff"
                />
              </div>
              
              <div className="pt-4 border-t">
                <Timeline size="small">
                  <Timeline.Item color="red">
                    <Text className="text-xs">检测到SQL注入漏洞</Text>
                    <br />
                    <Text type="secondary" className="text-xs">2小时前</Text>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <Text className="text-xs">发现过时依赖包</Text>
                    <br />
                    <Text type="secondary" className="text-xs">3小时前</Text>
                  </Timeline.Item>
                  <Timeline.Item color="green">
                    <Text className="text-xs">修复敏感信息泄露</Text>
                    <br />
                    <Text type="secondary" className="text-xs">5小时前</Text>
                  </Timeline.Item>
                </Timeline>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  /**
   * 渲染漏洞管理
   */
  const renderVulnerabilityManagement = () => {
    const vulnColumns = [
      {
        title: '严重性',
        dataIndex: 'severity',
        key: 'severity',
        width: 100,
        render: (severity: string) => (
          <Tag color={getSeverityColor(severity)}>
            {severity.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: '漏洞信息',
        key: 'vulnerability',
        render: (record: SecurityVulnerability) => (
          <div>
            <div className="font-medium">{record.title}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
            {record.file && (
              <div className="text-xs text-blue-500 mt-1">
                {record.file}:{record.line}
              </div>
            )}
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (type: string) => (
          <Tag>
            {type === 'dependency' ? '依赖' :
             type === 'code' ? '代码' :
             type === 'config' ? '配置' : '基础设施'}
          </Tag>
        ),
      },
      {
        title: 'CVSS',
        dataIndex: 'cvss',
        key: 'cvss',
        width: 80,
        render: (cvss: number) => (
          <span className={
            cvss >= 9 ? 'text-red-600' :
            cvss >= 7 ? 'text-orange-500' :
            cvss >= 4 ? 'text-yellow-500' : 'text-blue-500'
          }>
            {cvss}
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>
            {status === 'open' ? '待修复' :
             status === 'fixed' ? '已修复' :
             status === 'ignored' ? '已忽略' : '误报'}
          </Tag>
        ),
      },
      {
        title: '负责人',
        dataIndex: 'assignee',
        key: 'assignee',
        width: 100,
      },
      {
        title: '发现时间',
        dataIndex: 'discoveredAt',
        key: 'discoveredAt',
        width: 150,
      },
      {
        title: '操作',
        key: 'actions',
        width: 120,
        render: (record: SecurityVulnerability) => (
          <Space size="small">
            <Button size="small" type="link">
              查看
            </Button>
            {record.status === 'open' && (
              <Button size="small" type="link">
                修复
              </Button>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Card title="漏洞管理" extra={
        <Space>
          <Button icon={<ScanOutlined />}>
            扫描漏洞
          </Button>
          <Select defaultValue="all" size="small">
            <Option value="all">全部</Option>
            <Option value="open">待修复</Option>
            <Option value="critical">严重</Option>
            <Option value="high">高危</Option>
          </Select>
        </Space>
      }>
        <Table
          columns={vulnColumns}
          dataSource={vulnerabilities}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    );
  };

  /**
   * 渲染访问日志
   */
  const renderAccessLogs = () => {
    const logColumns = [
      {
        title: '用户',
        dataIndex: 'username',
        key: 'username',
        width: 120,
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 120,
      },
      {
        title: '资源',
        dataIndex: 'resource',
        key: 'resource',
        width: 200,
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        key: 'ip',
        width: 120,
      },
      {
        title: '位置',
        dataIndex: 'location',
        key: 'location',
        width: 120,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => (
          <Badge 
            status={getStatusColor(status)} 
            text={
              status === 'success' ? '成功' :
              status === 'failed' ? '失败' : '阻止'
            }
          />
        ),
      },
      {
        title: '风险',
        dataIndex: 'risk',
        key: 'risk',
        width: 80,
        render: (risk: string) => (
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getRiskColor(risk) }}
            />
            {risk.toUpperCase()}
          </div>
        ),
      },
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 150,
      },
    ];

    return (
      <Card title="访问日志">
        <Table
          columns={logColumns}
          dataSource={accessLogs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    );
  };

  /**
   * 渲染合规检查
   */
  const renderComplianceChecks = () => {
    const complianceColumns = [
      {
        title: '标准',
        dataIndex: 'standard',
        key: 'standard',
        width: 100,
      },
      {
        title: '要求',
        dataIndex: 'requirement',
        key: 'requirement',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => (
          <Tag color={getStatusColor(status)}>
            {status === 'compliant' ? '合规' :
             status === 'non_compliant' ? '不合规' :
             status === 'partial' ? '部分合规' : '不适用'}
          </Tag>
        ),
      },
      {
        title: '上次检查',
        dataIndex: 'lastCheck',
        key: 'lastCheck',
        width: 120,
      },
      {
        title: '下次检查',
        dataIndex: 'nextCheck',
        key: 'nextCheck',
        width: 120,
      },
      {
        title: '操作',
        key: 'actions',
        width: 100,
        render: (record: ComplianceCheck) => (
          <Space size="small">
            <Button size="small" type="link">
              检查
            </Button>
            <Button size="small" type="link">
              详情
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Card title="合规检查">
        <Table
          columns={complianceColumns}
          dataSource={complianceChecks}
          rowKey="id"
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
      {/* 页面标题 */}
      <Card>
        <div className="flex items-center justify-between">
          <Title level={3} className="mb-0">
            <ShieldOutlined className="mr-2" />
            安全中心
          </Title>
          <Space>
            <Button icon={<ScanOutlined />}>
              全面扫描
            </Button>
            <Button type="primary" icon={<AuditOutlined />}>
              安全审计
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主要内容 */}
      <Tabs defaultActiveKey="overview">
        <TabPane tab="安全概览" key="overview">
          {renderSecurityOverview()}
        </TabPane>
        
        <TabPane tab="漏洞管理" key="vulnerabilities">
          {renderVulnerabilityManagement()}
        </TabPane>
        
        <TabPane tab="访问日志" key="access-logs">
          {renderAccessLogs()}
        </TabPane>
        
        <TabPane tab="合规检查" key="compliance">
          {renderComplianceChecks()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SecurityCenter;