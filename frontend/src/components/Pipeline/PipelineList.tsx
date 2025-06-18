import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Dropdown,
  Modal,
  Progress,
  Typography,
  message,
  Avatar,
  Tooltip,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface PipelineExecution {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  trigger: 'manual' | 'webhook' | 'schedule' | 'api';
  triggeredBy: string;
  branch: string;
  commit: string;
  commitMessage: string;
  stages: PipelineStage[];
  logs?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  jobs: PipelineJob[];
}

interface PipelineJob {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: string;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  status: 'active' | 'inactive' | 'archived';
  lastExecution?: PipelineExecution;
  successRate: number;
  totalExecutions: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

interface PipelineListProps {
  projectId?: string;
}

/**
 * 流水线列表组件
 * 显示和管理CI/CD流水线
 */
const PipelineList: React.FC<PipelineListProps> = ({ projectId }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  // 模拟数据
  const [pipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'Frontend Build & Deploy',
      description: '前端应用构建和部署流水线',
      repository: 'clouddev-frontend',
      branch: 'main',
      status: 'active',
      successRate: 95.2,
      totalExecutions: 156,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
      createdBy: 'John Doe',
      tags: ['frontend', 'react', 'production'],
      lastExecution: {
        id: 'exec-1',
        pipelineId: '1',
        pipelineName: 'Frontend Build & Deploy',
        status: 'success',
        startTime: '2024-01-16 14:30:00',
        endTime: '2024-01-16 14:45:00',
        duration: 900,
        trigger: 'webhook',
        triggeredBy: 'Jane Smith',
        branch: 'main',
        commit: 'a1b2c3d',
        commitMessage: 'feat: add CI/CD pipeline management',
        stages: [],
      },
    },
    {
      id: '2',
      name: 'Backend API Tests',
      description: '后端API自动化测试流水线',
      repository: 'clouddev-backend',
      branch: 'develop',
      status: 'active',
      successRate: 87.5,
      totalExecutions: 89,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-16',
      createdBy: 'Bob Wilson',
      tags: ['backend', 'testing', 'api'],
      lastExecution: {
        id: 'exec-2',
        pipelineId: '2',
        pipelineName: 'Backend API Tests',
        status: 'running',
        startTime: '2024-01-16 15:00:00',
        duration: 300,
        trigger: 'manual',
        triggeredBy: 'Bob Wilson',
        branch: 'develop',
        commit: 'e4f5g6h',
        commitMessage: 'test: add integration tests',
        stages: [],
      },
    },
    {
      id: '3',
      name: 'Security Scan',
      description: '安全漏洞扫描流水线',
      repository: 'clouddev-platform',
      branch: 'main',
      status: 'active',
      successRate: 78.9,
      totalExecutions: 45,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-15',
      createdBy: 'Alice Chen',
      tags: ['security', 'scanning'],
      lastExecution: {
        id: 'exec-3',
        pipelineId: '3',
        pipelineName: 'Security Scan',
        status: 'failed',
        startTime: '2024-01-16 12:00:00',
        endTime: '2024-01-16 12:30:00',
        duration: 1800,
        trigger: 'schedule',
        triggeredBy: 'System',
        branch: 'main',
        commit: 'i7j8k9l',
        commitMessage: 'security: update dependencies',
        stages: [],
      },
    },
  ]);

  /**
   * 获取状态颜色
   */
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'running': return 'processing';
      case 'failed': return 'error';
      case 'cancelled': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  }, []);

  /**
   * 获取状态图标
   */
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined className="text-green-500" />;
      case 'running': return <ClockCircleOutlined className="text-blue-500" />;
      case 'failed': return <CloseCircleOutlined className="text-red-500" />;
      case 'cancelled': return <WarningOutlined className="text-yellow-500" />;
      case 'pending': return <ClockCircleOutlined className="text-gray-500" />;
      default: return <ClockCircleOutlined className="text-gray-500" />;
    }
  }, []);

  /**
   * 格式化持续时间
   */
  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  /**
   * 运行流水线
   */
  const handleRunPipeline = useCallback((pipelineId: string) => {
    message.success('流水线已启动');
    // TODO: 调用API启动流水线
  }, []);

  /**
   * 停止流水线
   */
  const handleStopPipeline = useCallback((pipelineId: string) => {
    Modal.confirm({
      title: '确认停止流水线？',
      content: '正在运行的流水线将被强制停止。',
      onOk: () => {
        message.success('流水线已停止');
        // TODO: 调用API停止流水线
      },
    });
  }, []);

  /**
   * 编辑流水线
   */
  const handleEditPipeline = useCallback((pipelineId: string) => {
    message.info('编辑功能开发中');
    // TODO: 打开编辑流水线模态框
  }, []);

  /**
   * 删除流水线
   */
  const handleDeletePipeline = useCallback((pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setIsDeleteModalVisible(true);
  }, []);

  /**
   * 确认删除流水线
   */
  const handleConfirmDelete = useCallback(() => {
    if (selectedPipeline) {
      message.success(`流水线 "${selectedPipeline.name}" 已删除`);
      setIsDeleteModalVisible(false);
      setSelectedPipeline(null);
      // TODO: 调用API删除流水线
    }
  }, [selectedPipeline]);

  /**
   * 查看流水线历史
   */
  const handleViewHistory = useCallback((pipelineId: string) => {
    message.info('历史记录功能开发中');
    // TODO: 打开历史记录模态框
  }, []);

  /**
   * 获取操作菜单
   */
  const getActionMenu = useCallback((pipeline: Pipeline) => ({
    items: [
      {
        key: 'run',
        label: '运行',
        icon: <PlayCircleOutlined />,
        disabled: pipeline.lastExecution?.status === 'running',
      },
      {
        key: 'stop',
        label: '停止',
        icon: <StopOutlined />,
        disabled: pipeline.lastExecution?.status !== 'running',
      },
      { type: 'divider' as const },
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
      },
      {
        key: 'history',
        label: '历史记录',
        icon: <HistoryOutlined />,
      },
      {
        key: 'settings',
        label: '设置',
        icon: <SettingOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      switch (key) {
        case 'run':
          handleRunPipeline(pipeline.id);
          break;
        case 'stop':
          handleStopPipeline(pipeline.id);
          break;
        case 'edit':
          handleEditPipeline(pipeline.id);
          break;
        case 'history':
          handleViewHistory(pipeline.id);
          break;
        case 'delete':
          handleDeletePipeline(pipeline);
          break;
      }
    },
  }), [handleRunPipeline, handleStopPipeline, handleEditPipeline, handleViewHistory, handleDeletePipeline]);

  const columns: ColumnsType<Pipeline> = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record: Pipeline) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
          <div className="flex items-center space-x-1 mt-1">
            {record.tags.map(tag => (
              <Tag key={tag} size="small">{tag}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '仓库/分支',
      key: 'repository',
      width: 200,
      render: (_, record: Pipeline) => (
        <div>
          <div className="font-medium">{record.repository}</div>
          <div className="text-sm text-gray-500">{record.branch}</div>
        </div>
      ),
    },
    {
      title: '最近执行',
      key: 'lastExecution',
      width: 200,
      render: (_, record: Pipeline) => {
        if (!record.lastExecution) {
          return <Text type="secondary">暂无执行记录</Text>;
        }
        
        const execution = record.lastExecution;
        return (
          <div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(execution.status)}
              <Tag color={getStatusColor(execution.status)}>
                {execution.status}
              </Tag>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {execution.endTime ? formatDuration(execution.duration || 0) : 
               `进行中 ${formatDuration(Math.floor((Date.now() - new Date(execution.startTime).getTime()) / 1000))}`}
            </div>
            <div className="text-xs text-gray-400">
              {execution.triggeredBy} · {execution.startTime}
            </div>
          </div>
        );
      },
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 150,
      render: (rate: number, record: Pipeline) => (
        <div>
          <Progress
            percent={rate}
            size="small"
            status={rate >= 90 ? 'success' : rate >= 70 ? 'active' : 'exception'}
            showInfo={false}
          />
          <div className="text-sm text-gray-500 mt-1">
            {rate}% ({record.totalExecutions} 次)
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
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
          {status === 'active' ? '活跃' : status === 'inactive' ? '未激活' : '归档'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record: Pipeline) => (
        <Space>
          <Tooltip title="运行流水线">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunPipeline(record.id)}
              disabled={record.lastExecution?.status === 'running'}
            />
          </Tooltip>
          
          <Dropdown menu={getActionMenu(record)} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Title level={4} className="mb-0">流水线管理</Title>
          <Badge count={pipelines.length} showZero>
            <span className="text-sm text-gray-500">总计</span>
          </Badge>
        </div>
        
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('创建流水线功能开发中')}
          >
            创建流水线
          </Button>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={() => message.success('已刷新')}
          >
            刷新
          </Button>
          
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => message.info('批量删除功能开发中')}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      {/* 流水线表格 */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={pipelines}
          rowKey="id"
          pagination={{
            total: pipelines.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除流水线"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        okType="danger"
      >
        {selectedPipeline && (
          <div>
            <p>确定要删除流水线 <strong>"{selectedPipeline.name}"</strong> 吗？</p>
            <p className="text-gray-500">
              删除后将无法恢复，包括所有执行历史记录。
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PipelineList;