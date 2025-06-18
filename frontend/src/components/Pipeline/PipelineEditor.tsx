import React, { useState, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Tabs,
  Typography,
  Row,
  Col,
  Divider,
  Alert,
  Tag,
  Modal,
  message,
} from 'antd';
import {
  SaveOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PipelineStageConfig {
  id: string;
  name: string;
  dependsOn: string[];
  jobs: PipelineJobConfig[];
}

interface PipelineJobConfig {
  id: string;
  name: string;
  image: string;
  script: string[];
  variables?: Record<string, string>;
  artifacts?: string[];
  cache?: string[];
}

interface PipelineConfig {
  id?: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  triggers: {
    webhook: boolean;
    schedule: string;
    manual: boolean;
  };
  variables: Record<string, string>;
  stages: PipelineStageConfig[];
}

interface PipelineEditorProps {
  pipelineId?: string;
  onSave?: (config: PipelineConfig) => void;
  onCancel?: () => void;
}

/**
 * 流水线编辑器组件
 * 可视化编辑CI/CD流水线配置
 */
const PipelineEditor: React.FC<PipelineEditorProps> = ({
  pipelineId,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [yamlContent, setYamlContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 初始配置
  const [config, setConfig] = useState<PipelineConfig>({
    name: '',
    description: '',
    repository: '',
    branch: 'main',
    triggers: {
      webhook: true,
      schedule: '',
      manual: true,
    },
    variables: {
      NODE_ENV: 'production',
    },
    stages: [
      {
        id: 'build',
        name: 'Build',
        dependsOn: [],
        jobs: [
          {
            id: 'build-job',
            name: 'Build Application',
            image: 'node:18',
            script: ['npm install', 'npm run build'],
            artifacts: ['dist/'],
            cache: ['node_modules/'],
          },
        ],
      },
      {
        id: 'test',
        name: 'Test',
        dependsOn: ['build'],
        jobs: [
          {
            id: 'test-job',
            name: 'Run Tests',
            image: 'node:18',
            script: ['npm run test'],
          },
        ],
      },
    ],
  });

  /**
   * 保存流水线配置
   */
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const finalConfig = { ...config, ...values };
      
      if (onSave) {
        onSave(finalConfig);
      }
      
      message.success('流水线配置已保存');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [config, form, onSave]);

  /**
   * 运行流水线
   */
  const handleRun = useCallback(() => {
    Modal.confirm({
      title: '确认运行流水线？',
      content: '将使用当前配置立即运行流水线。',
      onOk: () => {
        message.success('流水线已启动');
        // TODO: 调用API运行流水线
      },
    });
  }, []);

  /**
   * 添加阶段
   */
  const handleAddStage = useCallback(() => {
    const newStage: PipelineStageConfig = {
      id: `stage-${Date.now()}`,
      name: '新阶段',
      dependsOn: [],
      jobs: [
        {
          id: `job-${Date.now()}`,
          name: '新任务',
          image: 'ubuntu:latest',
          script: ['echo "Hello World"'],
        },
      ],
    };
    
    setConfig(prev => ({
      ...prev,
      stages: [...prev.stages, newStage],
    }));
  }, []);

  /**
   * 删除阶段
   */
  const handleDeleteStage = useCallback((stageId: string) => {
    Modal.confirm({
      title: '确认删除阶段？',
      content: '删除后无法恢复。',
      onOk: () => {
        setConfig(prev => ({
          ...prev,
          stages: prev.stages.filter(stage => stage.id !== stageId),
        }));
      },
    });
  }, []);

  /**
   * 更新阶段
   */
  const handleUpdateStage = useCallback((stageId: string, updates: Partial<PipelineStageConfig>) => {
    setConfig(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      ),
    }));
  }, []);

  /**
   * 添加任务
   */
  const handleAddJob = useCallback((stageId: string) => {
    const newJob: PipelineJobConfig = {
      id: `job-${Date.now()}`,
      name: '新任务',
      image: 'ubuntu:latest',
      script: ['echo "Hello World"'],
    };
    
    handleUpdateStage(stageId, {
      jobs: [...(config.stages.find(s => s.id === stageId)?.jobs || []), newJob],
    });
  }, [config.stages, handleUpdateStage]);

  /**
   * 删除任务
   */
  const handleDeleteJob = useCallback((stageId: string, jobId: string) => {
    const stage = config.stages.find(s => s.id === stageId);
    if (stage) {
      handleUpdateStage(stageId, {
        jobs: stage.jobs.filter(job => job.id !== jobId),
      });
    }
  }, [config.stages, handleUpdateStage]);

  /**
   * 生成YAML配置
   */
  const generateYAML = useCallback(() => {
    // 简化的YAML生成逻辑
    const yaml = `
# CloudDev Pipeline Configuration
name: ${config.name}
description: ${config.description}

# Repository Configuration
repository: ${config.repository}
branch: ${config.branch}

# Triggers
triggers:
  webhook: ${config.triggers.webhook}
  manual: ${config.triggers.manual}
  ${config.triggers.schedule ? `schedule: "${config.triggers.schedule}"` : ''}

# Global Variables
variables:
${Object.entries(config.variables).map(([key, value]) => `  ${key}: "${value}"`).join('\n')}

# Pipeline Stages
stages:
${config.stages.map(stage => `
  - name: ${stage.name}
    ${stage.dependsOn.length > 0 ? `depends_on: [${stage.dependsOn.join(', ')}]` : ''}
    jobs:
${stage.jobs.map(job => `
      - name: ${job.name}
        image: ${job.image}
        script:
${job.script.map(cmd => `          - ${cmd}`).join('\n')}
        ${job.artifacts ? `artifacts:\n${job.artifacts.map(artifact => `          - ${artifact}`).join('\n')}` : ''}
        ${job.cache ? `cache:\n${job.cache.map(cache => `          - ${cache}`).join('\n')}` : ''}
`).join('')}`).join('')}
    `.trim();
    
    setYamlContent(yaml);
  }, [config]);

  /**
   * 渲染基本配置
   */
  const renderBasicConfig = () => (
    <Card title="基本配置">
      <Form form={form} layout="vertical" initialValues={config}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="流水线名称"
              rules={[{ required: true, message: '请输入流水线名称' }]}
            >
              <Input placeholder="请输入流水线名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="repository"
              label="仓库地址"
              rules={[{ required: true, message: '请输入仓库地址' }]}
            >
              <Input placeholder="git@github.com:user/repo.git" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={3} placeholder="请输入流水线描述" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="branch"
              label="默认分支"
              rules={[{ required: true, message: '请选择默认分支' }]}
            >
              <Select placeholder="选择分支">
                <Option value="main">main</Option>
                <Option value="master">master</Option>
                <Option value="develop">develop</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>触发配置</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name={['triggers', 'webhook']} valuePropName="checked">
              <Switch /> <Text>Webhook触发</Text>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['triggers', 'manual']} valuePropName="checked">
              <Switch /> <Text>手动触发</Text>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['triggers', 'schedule']} label="定时触发">
              <Input placeholder="0 0 * * *" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  /**
   * 渲染阶段配置
   */
  const renderStagesConfig = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>流水线阶段</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStage}>
          添加阶段
        </Button>
      </div>

      {config.stages.map((stage, stageIndex) => (
        <Card
          key={stage.id}
          title={
            <div className="flex items-center justify-between">
              <Input
                value={stage.name}
                onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                className="font-medium"
                bordered={false}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteStage(stage.id)}
              />
            </div>
          }
          size="small"
        >
          <div className="space-y-4">
            {/* 依赖配置 */}
            <div>
              <Text strong>依赖阶段:</Text>
              <Select
                mode="multiple"
                placeholder="选择依赖的阶段"
                value={stage.dependsOn}
                onChange={(value) => handleUpdateStage(stage.id, { dependsOn: value })}
                className="w-full mt-2"
              >
                {config.stages
                  .filter(s => s.id !== stage.id)
                  .map(s => (
                    <Option key={s.id} value={s.id}>{s.name}</Option>
                  ))}
              </Select>
            </div>

            {/* 任务列表 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>任务列表:</Text>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddJob(stage.id)}
                >
                  添加任务
                </Button>
              </div>

              {stage.jobs.map((job, jobIndex) => (
                <Card key={job.id} size="small" className="mb-2 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={job.name}
                        onChange={(e) => {
                          const updatedJobs = [...stage.jobs];
                          updatedJobs[jobIndex] = { ...job, name: e.target.value };
                          handleUpdateStage(stage.id, { jobs: updatedJobs });
                        }}
                        className="font-medium"
                        bordered={false}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteJob(stage.id, job.id)}
                      />
                    </div>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>镜像:</Text>
                        <Input
                          value={job.image}
                          onChange={(e) => {
                            const updatedJobs = [...stage.jobs];
                            updatedJobs[jobIndex] = { ...job, image: e.target.value };
                            handleUpdateStage(stage.id, { jobs: updatedJobs });
                          }}
                          placeholder="镜像名称"
                          className="mt-1"
                        />
                      </Col>
                    </Row>

                    <div>
                      <Text strong>执行脚本:</Text>
                      <TextArea
                        rows={4}
                        value={job.script.join('\n')}
                        onChange={(e) => {
                          const updatedJobs = [...stage.jobs];
                          updatedJobs[jobIndex] = { 
                            ...job, 
                            script: e.target.value.split('\n').filter(line => line.trim())
                          };
                          handleUpdateStage(stage.id, { jobs: updatedJobs });
                        }}
                        placeholder="每行一个命令"
                        className="mt-1"
                      />
                    </div>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>构建产物:</Text>
                        <Input
                          value={job.artifacts?.join(', ') || ''}
                          onChange={(e) => {
                            const updatedJobs = [...stage.jobs];
                            updatedJobs[jobIndex] = { 
                              ...job, 
                              artifacts: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            };
                            handleUpdateStage(stage.id, { jobs: updatedJobs });
                          }}
                          placeholder="dist/, build/, 用逗号分隔"
                          className="mt-1"
                        />
                      </Col>
                      <Col span={12}>
                        <Text strong>缓存目录:</Text>
                        <Input
                          value={job.cache?.join(', ') || ''}
                          onChange={(e) => {
                            const updatedJobs = [...stage.jobs];
                            updatedJobs[jobIndex] = { 
                              ...job, 
                              cache: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            };
                            handleUpdateStage(stage.id, { jobs: updatedJobs });
                          }}
                          placeholder="node_modules/, .cache/, 用逗号分隔"
                          className="mt-1"
                        />
                      </Col>
                    </Row>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  /**
   * 渲染变量配置
   */
  const renderVariablesConfig = () => (
    <Card title="环境变量">
      <div className="space-y-3">
        {Object.entries(config.variables).map(([key, value]) => (
          <Row key={key} gutter={16} align="middle">
            <Col span={10}>
              <Input
                value={key}
                onChange={(e) => {
                  const newVariables = { ...config.variables };
                  delete newVariables[key];
                  newVariables[e.target.value] = value;
                  setConfig(prev => ({ ...prev, variables: newVariables }));
                }}
                placeholder="变量名"
              />
            </Col>
            <Col span={10}>
              <Input
                value={value}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    variables: { ...prev.variables, [key]: e.target.value }
                  }));
                }}
                placeholder="变量值"
              />
            </Col>
            <Col span={4}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newVariables = { ...config.variables };
                  delete newVariables[key];
                  setConfig(prev => ({ ...prev, variables: newVariables }));
                }}
              />
            </Col>
          </Row>
        ))}
        
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => {
            setConfig(prev => ({
              ...prev,
              variables: { ...prev.variables, ['NEW_VAR']: '' }
            }));
          }}
          className="w-full"
        >
          添加变量
        </Button>
      </div>
    </Card>
  );

  /**
   * 渲染YAML预览
   */
  const renderYAMLPreview = () => {
    React.useEffect(() => {
      generateYAML();
    }, [generateYAML]);

    return (
      <Card title="YAML配置预览">
        <Alert
          message="配置预览"
          description="以下是生成的YAML配置文件，您可以复制此配置用于其他CI/CD系统。"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <Editor
          height="400px"
          language="yaml"
          value={yamlContent}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <Title level={3} className="mb-0">
          {pipelineId ? '编辑流水线' : '创建流水线'}
        </Title>
        
        <Space>
          <Button onClick={onCancel}>
            取消
          </Button>
          
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              generateYAML();
              setActiveTab('yaml');
            }}
          >
            预览
          </Button>
          
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
          >
            保存
          </Button>
          
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleRun}
          >
            保存并运行
          </Button>
        </Space>
      </div>

      {/* 配置表单 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基本配置" key="basic">
          {renderBasicConfig()}
        </TabPane>
        
        <TabPane tab="阶段配置" key="stages">
          {renderStagesConfig()}
        </TabPane>
        
        <TabPane tab="环境变量" key="variables">
          {renderVariablesConfig()}
        </TabPane>
        
        <TabPane tab="YAML预览" key="yaml">
          {renderYAMLPreview()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PipelineEditor;