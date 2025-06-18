import React, { useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Tag,
  Typography,
  Space,
  Dropdown,
  Badge,
  Progress,
  Row,
  Col,
  Statistic,
  List,
  message,
  Tooltip,
  DatePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  GitlabOutlined,
  BugOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'developer' | 'tester' | 'designer' | 'viewer';
  department: string;
  position: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  workload: number; // 0-100
  skills: string[];
  // 统计数据
  tasksCompleted: number;
  commitsCount: number;
  codeReviews: number;
  bugsFixed: number;
  // 联系信息
  phone?: string;
  location?: string;
  timezone?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
}

interface TeamManagementProps {
  projectId: string;
}

/**
 * 团队管理组件
 * 提供成员管理、权限控制和团队统计
 */
const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 模拟数据
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://via.placeholder.com/40/4CAF50/ffffff?text=JD',
      role: 'owner',
      department: '研发部',
      position: '技术总监',
      status: 'active',
      joinDate: '2023-01-15',
      lastActive: '2分钟前',
      workload: 85,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      tasksCompleted: 142,
      commitsCount: 856,
      codeReviews: 234,
      bugsFixed: 67,
      phone: '+86 138-0013-8000',
      location: '北京',
      timezone: 'UTC+8',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'https://via.placeholder.com/40/2196F3/ffffff?text=JS',
      role: 'admin',
      department: '研发部',
      position: '前端架构师',
      status: 'active',
      joinDate: '2023-02-20',
      lastActive: '15分钟前',
      workload: 92,
      skills: ['Vue.js', 'React', 'CSS', 'UI/UX'],
      tasksCompleted: 98,
      commitsCount: 542,
      codeReviews: 156,
      bugsFixed: 23,
      phone: '+86 138-0013-8001',
      location: '上海',
      timezone: 'UTC+8',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      avatar: 'https://via.placeholder.com/40/FF9800/ffffff?text=BW',
      role: 'developer',
      department: '研发部',
      position: '后端开发工程师',
      status: 'active',
      joinDate: '2023-03-10',
      lastActive: '1小时前',
      workload: 78,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
      tasksCompleted: 76,
      commitsCount: 389,
      codeReviews: 89,
      bugsFixed: 34,
      phone: '+86 138-0013-8002',
      location: '深圳',
      timezone: 'UTC+8',
    },
    {
      id: '4',
      name: 'Alice Chen',
      email: 'alice.chen@example.com',
      role: 'designer',
      department: '设计部',
      position: 'UI/UX设计师',
      status: 'active',
      joinDate: '2023-04-05',
      lastActive: '30分钟前',
      workload: 65,
      skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
      tasksCompleted: 45,
      commitsCount: 12,
      codeReviews: 8,
      bugsFixed: 2,
      location: '广州',
      timezone: 'UTC+8',
    },
    {
      id: '5',
      name: 'Charlie Davis',
      email: 'charlie.davis@example.com',
      role: 'tester',
      department: '质量部',
      position: '测试工程师',
      status: 'inactive',
      joinDate: '2023-05-12',
      lastActive: '3天前',
      workload: 45,
      skills: ['Selenium', 'Jest', 'Cypress', 'Performance Testing'],
      tasksCompleted: 32,
      commitsCount: 56,
      codeReviews: 23,
      bugsFixed: 78,
      location: '杭州',
      timezone: 'UTC+8',
    },
  ]);

  const [invitations] = useState<Invitation[]>([
    {
      id: '1',
      email: 'diana.lee@example.com',
      role: 'developer',
      invitedBy: 'John Doe',
      invitedAt: '2024-01-15',
      status: 'pending',
      expiresAt: '2024-01-22',
    },
    {
      id: '2',
      email: 'frank.miller@example.com',
      role: 'tester',
      invitedBy: 'Jane Smith',
      invitedAt: '2024-01-14',
      status: 'accepted',
      expiresAt: '2024-01-21',
    },
  ]);

  /**
   * 获取角色标签颜色
   */
  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'owner': return 'purple';
      case 'admin': return 'red';
      case 'developer': return 'blue';
      case 'tester': return 'green';
      case 'designer': return 'orange';
      case 'viewer': return 'default';
      default: return 'default';
    }
  }, []);

  /**
   * 获取状态标签颜色
   */
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'pending': return 'processing';
      default: return 'default';
    }
  }, []);

  /**
   * 获取工作负载颜色
   */
  const getWorkloadColor = useCallback((workload: number) => {
    if (workload >= 90) return '#ff4d4f';
    if (workload >= 70) return '#faad14';
    return '#52c41a';
  }, []);

  /**
   * 邀请成员
   */
  const handleInviteMember = useCallback(async () => {
    try {
      const values = await inviteForm.validateFields();
      
      // TODO: 调用API发送邀请
      message.success(`邀请已发送到 ${values.email}`);
      setIsInviteModalVisible(false);
      inviteForm.resetFields();
    } catch (error) {
      console.error('邀请失败:', error);
    }
  }, [inviteForm]);

  /**
   * 编辑成员
   */
  const handleEditMember = useCallback((member: TeamMember) => {
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      position: member.position,
      phone: member.phone,
      location: member.location,
      skills: member.skills,
    });
    setIsEditModalVisible(true);
  }, [form]);

  /**
   * 保存成员信息
   */
  const handleSaveMember = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMember) {
        const updatedMembers = members.map(member =>
          member.id === editingMember.id
            ? { ...member, ...values }
            : member
        );
        setMembers(updatedMembers);
        message.success('成员信息已更新');
      }
      
      setIsEditModalVisible(false);
      setEditingMember(null);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, [form, editingMember, members]);

  /**
   * 删除成员
   */
  const handleDeleteMember = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    Modal.confirm({
      title: '确认删除成员？',
      content: `确定要从项目中删除 ${member.name} 吗？此操作无法撤销。`,
      onOk: () => {
        setMembers(members.filter(m => m.id !== memberId));
        message.success('成员已删除');
      },
    });
  }, [members]);

  /**
   * 批量删除成员
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '确认批量删除？',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个成员吗？`,
      onOk: () => {
        setMembers(members.filter(m => !selectedRowKeys.includes(m.id)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  }, [selectedRowKeys, members]);

  /**
   * 获取成员操作菜单
   */
  const getMemberMenu = useCallback((member: TeamMember) => ({
    items: [
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
      },
      {
        key: 'changeRole',
        label: '更改角色',
        icon: <UserOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: member.role === 'owner',
      },
    ],
    onClick: ({ key }: { key: string }) => {
      switch (key) {
        case 'edit':
          handleEditMember(member);
          break;
        case 'delete':
          handleDeleteMember(member.id);
          break;
      }
    },
  }), [handleEditMember, handleDeleteMember]);

  const columns: ColumnsType<TeamMember> = [
    {
      title: '成员',
      key: 'member',
      width: 200,
      render: (_, record: TeamMember) => (
        <div className="flex items-center space-x-3">
          <Badge 
            dot 
            color={record.status === 'active' ? '#52c41a' : '#d9d9d9'}
            offset={[-4, 4]}
          >
            <Avatar 
              size={40}
              src={record.avatar} 
              icon={<UserOutlined />}
            />
          </Badge>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色/部门',
      key: 'role',
      width: 150,
      render: (_, record: TeamMember) => (
        <div>
          <Tag color={getRoleColor(record.role)}>
            {record.role}
          </Tag>
          <div className="text-sm text-gray-500 mt-1">
            {record.department}
          </div>
          <div className="text-xs text-gray-400">
            {record.position}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? '活跃' : status === 'inactive' ? '不活跃' : '待加入'}
        </Tag>
      ),
    },
    {
      title: '工作负载',
      dataIndex: 'workload',
      key: 'workload',
      width: 120,
      render: (workload: number) => (
        <div>
          <Progress
            percent={workload}
            size="small"
            strokeColor={getWorkloadColor(workload)}
            showInfo={false}
          />
          <div className="text-xs text-gray-500 mt-1">
            {workload}%
          </div>
        </div>
      ),
    },
    {
      title: '贡献统计',
      key: 'contribution',
      width: 120,
      render: (_, record: TeamMember) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircleOutlined className="text-green-500" />
            <span>{record.tasksCompleted} 任务</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <GitlabOutlined className="text-blue-500" />
            <span>{record.commitsCount} 提交</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <BugOutlined className="text-red-500" />
            <span>{record.bugsFixed} 修复</span>
          </div>
        </div>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
      width: 100,
      render: (lastActive: string) => (
        <Text type="secondary" className="text-sm">
          {lastActive}
        </Text>
      ),
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      width: 200,
      render: (skills: string[]) => (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map(skill => (
            <Tag key={skill} size="small">{skill}</Tag>
          ))}
          {skills.length > 3 && (
            <Tooltip title={skills.slice(3).join(', ')}>
              <Tag size="small">+{skills.length - 3}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record: TeamMember) => (
        <Dropdown menu={getMemberMenu(record)} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: TeamMember) => ({
      disabled: record.role === 'owner',
    }),
  };

  return (
    <div className="space-y-6">
      {/* 团队统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={members.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="活跃成员"
              value={members.filter(m => m.status === 'active').length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="平均工作负载"
              value={Math.round(members.reduce((sum, m) => sum + m.workload, 0) / members.length)}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="待处理邀请"
              value={invitations.filter(i => i.status === 'pending').length}
              prefix={<MailOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <Title level={4} className="mb-0">团队成员</Title>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={handleBatchDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => setIsInviteModalVisible(true)}
          >
            邀请成员
          </Button>
        </Space>
      </div>

      {/* 成员表格 */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={{
            total: members.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 待处理邀请 */}
      {invitations.filter(i => i.status === 'pending').length > 0 && (
        <Card title="待处理邀请">
          <List
            dataSource={invitations.filter(i => i.status === 'pending')}
            renderItem={(invitation) => (
              <List.Item
                actions={[
                  <Button size="small">重新发送</Button>,
                  <Button size="small" danger>取消邀请</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<MailOutlined />} />}
                  title={invitation.email}
                  description={
                    <div>
                      <Tag color={getRoleColor(invitation.role)}>
                        {invitation.role}
                      </Tag>
                      <span className="text-sm text-gray-500 ml-2">
                        由 {invitation.invitedBy} 邀请 · {invitation.invitedAt}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 邀请成员模态框 */}
      <Modal
        title="邀请团队成员"
        open={isInviteModalVisible}
        onOk={handleInviteMember}
        onCancel={() => setIsInviteModalVisible(false)}
        okText="发送邀请"
        cancelText="取消"
      >
        <Form form={inviteForm} layout="vertical">
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Option value="developer">开发者</Option>
              <Option value="tester">测试工程师</Option>
              <Option value="designer">设计师</Option>
              <Option value="viewer">观察者</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="邀请消息"
          >
            <TextArea
              rows={3}
              placeholder="可选择添加个人消息..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑成员模态框 */}
      <Modal
        title="编辑成员信息"
        open={isEditModalVisible}
        onOk={handleSaveMember}
        onCancel={() => setIsEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择角色">
                <Option value="admin">管理员</Option>
                <Option value="developer">开发者</Option>
                <Option value="tester">测试工程师</Option>
                <Option value="designer">设计师</Option>
                <Option value="viewer">观察者</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="department"
              label="部门"
            >
              <Input placeholder="请输入部门" />
            </Form.Item>
          </div>

          <Form.Item
            name="position"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="电话"
            >
              <Input placeholder="请输入电话号码" />
            </Form.Item>

            <Form.Item
              name="location"
              label="地点"
            >
              <Input placeholder="请输入工作地点" />
            </Form.Item>
          </div>

          <Form.Item
            name="skills"
            label="技能标签"
          >
            <Select
              mode="tags"
              placeholder="添加技能标签"
              style={{ width: '100%' }}
            >
              <Option value="React">React</Option>
              <Option value="Vue.js">Vue.js</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Java">Java</Option>
              <Option value="Python">Python</Option>
              <Option value="TypeScript">TypeScript</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;