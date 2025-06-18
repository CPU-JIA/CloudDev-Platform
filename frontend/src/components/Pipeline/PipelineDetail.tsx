import React, { useState, useCallback } from 'react';
import {
  Card,
  Steps,
  Button,
  Tag,
  Progress,
  Collapse,
  Typography,
  Space,
  Tooltip,
  Timeline,
  Avatar,
  message,
  Tabs,
  Descriptions,
  Alert,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  UserOutlined,
  BranchesOutlined,
  GitCommitOutlined,
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface PipelineJob {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs: string;
  artifacts?: string[];
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  jobs: PipelineJob[];
  dependsOn?: string[];
}

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
  commitAuthor: string;
  stages: PipelineStage[];
  variables?: Record<string, string>;
}

interface PipelineDetailProps {
  executionId: string;
  onBack?: () => void;
}

/**
 * 流水线详情组件
 * 显示流水线执行的详细信息
 */
const PipelineDetail: React.FC<PipelineDetailProps> = ({ executionId, onBack }) => {
  const [activeTab, setActiveTab] = useState('stages');
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['stage-1']);

  // 模拟数据
  const [execution] = useState<PipelineExecution>({
    id: 'exec-1',
    pipelineId: 'pipeline-1',
    pipelineName: 'Frontend Build & Deploy',
    status: 'running',
    startTime: '2024-01-16 14:30:00',
    duration: 420,
    trigger: 'webhook',
    triggeredBy: 'Jane Smith',
    branch: 'main',
    commit: 'a1b2c3d4',
    commitMessage: 'feat: add CI/CD pipeline management UI components',
    commitAuthor: 'Jane Smith',
    variables: {
      NODE_ENV: 'production',
      BUILD_TARGET: 'production',
      DEPLOY_ENV: 'staging',
    },
    stages: [
      {
        id: 'stage-1',
        name: 'Build',
        status: 'success',
        startTime: '2024-01-16 14:30:15',
        endTime: '2024-01-16 14:33:45',
        duration: 210,
        jobs: [
          {
            id: 'job-1',
            name: 'Install Dependencies',
            status: 'success',
            startTime: '2024-01-16 14:30:15',
            endTime: '2024-01-16 14:31:30',
            duration: 75,
            logs: 'npm install\n✓ Installed 1247 packages in 75s\n✓ Dependencies installation completed successfully',
          },
          {
            id: 'job-2',
            name: 'Build Application',
            status: 'success',
            startTime: '2024-01-16 14:31:35',
            endTime: '2024-01-16 14:33:45',
            duration: 130,
            logs: 'npm run build\n> Creating optimized production build...\n✓ Build completed successfully\n✓ Generated 15 static files',
            artifacts: ['build.zip', 'source-map.zip'],
          },
        ],
      },
      {
        id: 'stage-2',
        name: 'Test',
        status: 'success',
        startTime: '2024-01-16 14:33:50',
        endTime: '2024-01-16 14:35:20',
        duration: 90,
        dependsOn: ['stage-1'],
        jobs: [
          {
            id: 'job-3',
            name: 'Unit Tests',
            status: 'success',
            startTime: '2024-01-16 14:33:50',
            endTime: '2024-01-16 14:34:30',
            duration: 40,
            logs: 'npm run test\n✓ 156 tests passed\n✓ Coverage: 89.2%\n✓ All unit tests passed',
          },
          {
            id: 'job-4',
            name: 'Integration Tests',
            status: 'success',
            startTime: '2024-01-16 14:34:35',
            endTime: '2024-01-16 14:35:20',
            duration: 45,
            logs: 'npm run test:integration\n✓ 23 integration tests passed\n✓ API endpoints tested successfully',
          },
        ],
      },
      {
        id: 'stage-3',
        name: 'Deploy',
        status: 'running',
        startTime: '2024-01-16 14:35:25',
        dependsOn: ['stage-2'],
        jobs: [
          {
            id: 'job-5',
            name: 'Deploy to Staging',
            status: 'running',
            startTime: '2024-01-16 14:35:25',
            duration: 120,
            logs: 'Deploying to staging environment...\n✓ Docker image built successfully\n→ Pushing to container registry...\n→ Updating Kubernetes deployment...',
          },
        ],
      },
    ],
  });

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
      case 'skipped': return 'default';
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
      case 'skipped': return <InfoCircleOutlined className="text-gray-400" />;
      default: return <ClockCircleOutlined className="text-gray-500" />;
    }
  }, []);

  /**
   * 获取Steps状态
   */
  const getStepStatus = useCallback((status: string) => {
    switch (status) {
      case 'success': return 'finish';
      case 'running': return 'process';
      case 'failed': return 'error';
      case 'cancelled': return 'error';
      case 'pending': return 'wait';
      case 'skipped': return 'wait';
      default: return 'wait';
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
   * 计算总进度
   */
  const calculateProgress = useCallback(() => {
    const totalJobs = execution.stages.reduce((total, stage) => total + stage.jobs.length, 0);
    const completedJobs = execution.stages.reduce((total, stage) => 
      total + stage.jobs.filter(job => job.status === 'success').length, 0);
    return Math.round((completedJobs / totalJobs) * 100);
  }, [execution]);

  /**
   * 停止流水线
   */
  const handleStopPipeline = useCallback(() => {
    message.success('流水线已停止');
    // TODO: 调用API停止流水线
  }, []);

  /**
   * 重新运行流水线
   */
  const handleRerunPipeline = useCallback(() => {
    message.success('流水线已重新启动');
    // TODO: 调用API重新运行流水线
  }, []);

  /**
   * 下载构建产物
   */
  const handleDownloadArtifact = useCallback((artifactName: string) => {
    message.success(`正在下载 ${artifactName}`);
    // TODO: 调用API下载构建产物
  }, []);

  /**
   * 下载日志
   */
  const handleDownloadLogs = useCallback((jobId: string) => {
    message.success('正在下载日志');
    // TODO: 调用API下载日志
  }, []);

  /**
   * 渲染阶段步骤
   */
  const renderStages = () => (
    <div className="space-y-6">
      {/* 进度概览 */}
      <Card size="small">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Title level={5} className="mb-0">执行进度</Title>
            <Text type="secondary">{calculateProgress()}% 完成</Text>
          </div>
          
          <Progress 
            percent={calculateProgress()} 
            status={execution.status === 'failed' ? 'exception' : 'active'}
            strokeColor={execution.status === 'running' ? '#1890ff' : undefined}
          />
          
          <Steps 
            current={execution.stages.findIndex(stage => stage.status === 'running')}
            status={execution.status === 'failed' ? 'error' : 'process'}
          >
            {execution.stages.map((stage, index) => (
              <Step
                key={stage.id}
                title={stage.name}
                status={getStepStatus(stage.status)}
                description={stage.duration ? formatDuration(stage.duration) : undefined}
                icon={getStatusIcon(stage.status)}
              />
            ))}
          </Steps>
        </div>
      </Card>

      {/* 阶段详情 */}
      <Collapse 
        activeKey={expandedPanels}
        onChange={setExpandedPanels}
        ghost
      >
        {execution.stages.map((stage) => (
          <Panel
            key={stage.id}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(stage.status)}
                  <span className="font-medium">{stage.name}</span>
                  <Tag color={getStatusColor(stage.status)}>
                    {stage.status}
                  </Tag>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {stage.duration && <span>{formatDuration(stage.duration)}</span>}
                  {stage.startTime && <span>{stage.startTime}</span>}
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              {stage.jobs.map((job) => (
                <Card key={job.id} size="small" className="bg-gray-50">
                  <div className="space-y-3">
                    {/* 任务头部 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <span className="font-medium">{job.name}</span>
                        <Tag color={getStatusColor(job.status)}>
                          {job.status}
                        </Tag>
                      </div>
                      
                      <Space>
                        {job.duration && (
                          <Text type="secondary">{formatDuration(job.duration)}</Text>
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadLogs(job.id)}
                        >
                          下载日志
                        </Button>
                      </Space>
                    </div>

                    {/* 构建产物 */}
                    {job.artifacts && job.artifacts.length > 0 && (
                      <div>
                        <Text strong>构建产物:</Text>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.artifacts.map((artifact) => (
                            <Button
                              key={artifact}
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadArtifact(artifact)}
                            >
                              {artifact}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 日志输出 */}
                    <div>
                      <Text strong>日志输出:</Text>
                      <pre className="bg-black text-green-400 p-3 rounded mt-2 text-sm max-h-40 overflow-auto">
                        {job.logs}
                      </pre>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Panel>
        ))}
      </Collapse>
    </div>
  );

  /**
   * 渲染执行信息
   */
  const renderExecutionInfo = () => (
    <Card title="执行信息">
      <Descriptions column={2} bordered>
        <Descriptions.Item label="执行ID">{execution.id}</Descriptions.Item>
        <Descriptions.Item label="流水线">{execution.pipelineName}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={getStatusColor(execution.status)}>{execution.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="触发方式">
          <Tag>{execution.trigger}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="触发者">
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            {execution.triggeredBy}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="分支">
          <Space>
            <BranchesOutlined />
            {execution.branch}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="提交">
          <Space>
            <GitCommitOutlined />
            <Text code>{execution.commit}</Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="提交作者">{execution.commitAuthor}</Descriptions.Item>
        <Descriptions.Item label="开始时间">{execution.startTime}</Descriptions.Item>
        <Descriptions.Item label="持续时间">
          {execution.duration ? formatDuration(execution.duration) : '进行中'}
        </Descriptions.Item>
        <Descriptions.Item label="提交消息" span={2}>
          <Paragraph ellipsis={{ rows: 2, expandable: true }}>
            {execution.commitMessage}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>

      {execution.variables && Object.keys(execution.variables).length > 0 && (
        <div className="mt-6">
          <Title level={5}>环境变量</Title>
          <Descriptions column={1} bordered size="small">
            {Object.entries(execution.variables).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                <Text code>{value}</Text>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button onClick={onBack}>
              返回
            </Button>
          )}
          
          <div>
            <Title level={3} className="mb-0">{execution.pipelineName}</Title>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusIcon(execution.status)}
              <Tag color={getStatusColor(execution.status)} className="text-base px-3 py-1">
                {execution.status}
              </Tag>
              <Text type="secondary">执行ID: {execution.id}</Text>
            </div>
          </div>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => message.success('已刷新')}
          >
            刷新
          </Button>
          
          {execution.status === 'running' && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleStopPipeline}
            >
              停止
            </Button>
          )}
          
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRerunPipeline}
          >
            重新运行
          </Button>
        </Space>
      </div>

      {/* 状态提醒 */}
      {execution.status === 'running' && (
        <Alert
          message="流水线正在执行中"
          description="页面将自动刷新以显示最新状态"
          type="info"
          showIcon
        />
      )}

      {/* 主要内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="执行阶段" key="stages">
          {renderStages()}
        </TabPane>
        
        <TabPane tab="执行信息" key="info">
          {renderExecutionInfo()}
        </TabPane>
        
        <TabPane tab="执行历史" key="history">
          <Card>
            <Timeline>
              <Timeline.Item color="blue">
                <div className="font-medium">流水线开始执行</div>
                <div className="text-sm text-gray-500">{execution.startTime}</div>
              </Timeline.Item>
              
              {execution.stages.map((stage) => (
                <Timeline.Item
                  key={stage.id}
                  color={getStatusColor(stage.status)}
                  dot={getStatusIcon(stage.status)}
                >
                  <div className="font-medium">阶段 "{stage.name}" {stage.status}</div>
                  <div className="text-sm text-gray-500">
                    {stage.startTime} {stage.duration && `(${formatDuration(stage.duration)})`}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PipelineDetail;