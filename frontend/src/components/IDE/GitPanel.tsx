import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Tree,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Badge,
  Tabs,
  List,
  Typography,
  Tooltip,
  message,
  Space,
  Tag,
  Avatar,
  Timeline,
} from 'antd';
import type { TreeDataNode } from 'antd';
import {
  BranchesOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  HistoryOutlined,
  DiffOutlined,
  PullRequestOutlined,
  MergeOutlined,
  UserOutlined,
  CalendarOutlined,
  CommentOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface GitChange {
  id: string;
  filePath: string;
  fileName: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  authorEmail: string;
  authorAvatar?: string;
  date: string;
  branch: string;
  changes: GitChange[];
}

interface GitBranch {
  name: string;
  isActive: boolean;
  lastCommit: string;
  lastCommitDate: string;
  author: string;
}

interface PullRequest {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  createdAt: string;
  updatedAt: string;
  reviewers: string[];
  comments: number;
}

/**
 * Git面板组件
 * 提供版本控制功能
 */
const GitPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('changes');
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitModalVisible, setIsCommitModalVisible] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [isPullRequestModalVisible, setIsPullRequestModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟数据
  const [changes] = useState<GitChange[]>([
    {
      id: '1',
      filePath: 'src/components/Header.tsx',
      fileName: 'Header.tsx',
      status: 'modified',
      additions: 15,
      deletions: 3,
    },
    {
      id: '2',
      filePath: 'src/styles/global.css',
      fileName: 'global.css',
      status: 'modified',
      additions: 8,
      deletions: 2,
    },
    {
      id: '3',
      filePath: 'src/utils/newHelper.ts',
      fileName: 'newHelper.ts',
      status: 'added',
      additions: 45,
      deletions: 0,
    },
    {
      id: '4',
      filePath: 'src/components/OldComponent.tsx',
      fileName: 'OldComponent.tsx',
      status: 'deleted',
      additions: 0,
      deletions: 120,
    },
  ]);

  const [branches] = useState<GitBranch[]>([
    {
      name: 'main',
      isActive: false,
      lastCommit: 'feat: add user authentication',
      lastCommitDate: '2024-01-15',
      author: 'John Doe',
    },
    {
      name: 'feature/ide-improvements',
      isActive: true,
      lastCommit: 'wip: improve code editor',
      lastCommitDate: '2024-01-16',
      author: 'Jane Smith',
    },
    {
      name: 'bugfix/file-tree-issue',
      isActive: false,
      lastCommit: 'fix: file tree selection bug',
      lastCommitDate: '2024-01-14',
      author: 'Bob Wilson',
    },
  ]);

  const [commits] = useState<GitCommit[]>([
    {
      id: '1',
      hash: 'a1b2c3d',
      message: 'feat: add git integration panel',
      author: 'Jane Smith',
      authorEmail: 'jane@example.com',
      date: '2024-01-16 14:30',
      branch: 'feature/ide-improvements',
      changes: [
        { id: '1', filePath: 'src/components/GitPanel.tsx', fileName: 'GitPanel.tsx', status: 'added', additions: 200, deletions: 0 },
      ],
    },
    {
      id: '2',
      hash: 'e4f5g6h',
      message: 'style: improve UI components styling',
      author: 'John Doe',
      authorEmail: 'john@example.com',
      date: '2024-01-16 10:15',
      branch: 'feature/ide-improvements',
      changes: [
        { id: '1', filePath: 'src/styles/components.css', fileName: 'components.css', status: 'modified', additions: 25, deletions: 10 },
      ],
    },
    {
      id: '3',
      hash: 'i7j8k9l',
      message: 'fix: resolve file tree selection issue',
      author: 'Bob Wilson',
      authorEmail: 'bob@example.com',
      date: '2024-01-15 16:45',
      branch: 'main',
      changes: [
        { id: '1', filePath: 'src/components/FileTree.tsx', fileName: 'FileTree.tsx', status: 'modified', additions: 5, deletions: 8 },
      ],
    },
  ]);

  const [pullRequests] = useState<PullRequest[]>([
    {
      id: '1',
      title: 'Add IDE improvements and Git integration',
      description: 'This PR adds comprehensive IDE improvements including syntax highlighting, code folding, and Git integration features.',
      author: 'Jane Smith',
      sourceBranch: 'feature/ide-improvements',
      targetBranch: 'main',
      status: 'open',
      createdAt: '2024-01-16 09:00',
      updatedAt: '2024-01-16 14:30',
      reviewers: ['John Doe', 'Bob Wilson'],
      comments: 3,
    },
    {
      id: '2',
      title: 'Fix file tree selection bug',
      description: 'Resolves the issue where file selection was not working properly in certain scenarios.',
      author: 'Bob Wilson',
      sourceBranch: 'bugfix/file-tree-issue',
      targetBranch: 'main',
      status: 'merged',
      createdAt: '2024-01-14 11:20',
      updatedAt: '2024-01-15 16:50',
      reviewers: ['Jane Smith'],
      comments: 1,
    },
  ]);

  /**
   * 获取状态图标
   */
  const getStatusIcon = useCallback((status: GitChange['status']) => {
    switch (status) {
      case 'added': return <PlusOutlined className="text-green-500" />;
      case 'modified': return <DiffOutlined className="text-yellow-500" />;
      case 'deleted': return <CloseOutlined className="text-red-500" />;
      case 'renamed': return <CheckOutlined className="text-blue-500" />;
      default: return null;
    }
  }, []);

  /**
   * 获取状态标签
   */
  const getStatusTag = useCallback((status: GitChange['status']) => {
    const config = {
      added: { color: 'success', text: '新增' },
      modified: { color: 'warning', text: '修改' },
      deleted: { color: 'error', text: '删除' },
      renamed: { color: 'processing', text: '重命名' },
    };
    
    const { color, text } = config[status];
    return <Tag color={color}>{text}</Tag>;
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback((selectedKeys: string[]) => {
    setSelectedChanges(selectedKeys);
  }, []);

  /**
   * 暂存更改
   */
  const handleStageChanges = useCallback((changeIds: string[]) => {
    message.success(`已暂存 ${changeIds.length} 个文件的更改`);
  }, []);

  /**
   * 取消暂存
   */
  const handleUnstageChanges = useCallback((changeIds: string[]) => {
    message.success(`已取消暂存 ${changeIds.length} 个文件的更改`);
  }, []);

  /**
   * 丢弃更改
   */
  const handleDiscardChanges = useCallback((changeIds: string[]) => {
    Modal.confirm({
      title: '确认丢弃更改？',
      content: `这将永久丢弃 ${changeIds.length} 个文件的更改，无法恢复。`,
      okType: 'danger',
      onOk: () => {
        message.success('已丢弃更改');
      },
    });
  }, []);

  /**
   * 提交更改
   */
  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim()) {
      message.error('请输入提交消息');
      return;
    }

    if (selectedChanges.length === 0) {
      message.error('请选择要提交的文件');
      return;
    }

    try {
      // TODO: 调用API提交更改
      message.success('提交成功');
      setCommitMessage('');
      setSelectedChanges([]);
    } catch (error) {
      message.error('提交失败');
    }
  }, [commitMessage, selectedChanges]);

  /**
   * 创建分支
   */
  const handleCreateBranch = useCallback(async () => {
    try {
      const values = await form.validateFields();
      console.log('Creating branch:', values);
      message.success('分支创建成功');
      setIsBranchModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form]);

  /**
   * 切换分支
   */
  const handleSwitchBranch = useCallback((branchName: string) => {
    Modal.confirm({
      title: '确认切换分支？',
      content: `即将切换到分支 "${branchName}"，未提交的更改可能会丢失。`,
      onOk: () => {
        message.success(`已切换到分支 "${branchName}"`);
      },
    });
  }, []);

  /**
   * 合并分支
   */
  const handleMergeBranch = useCallback((branchName: string) => {
    Modal.confirm({
      title: '确认合并分支？',
      content: `即将将分支 "${branchName}" 合并到当前分支。`,
      onOk: () => {
        message.success(`分支 "${branchName}" 合并成功`);
      },
    });
  }, []);

  /**
   * 创建Pull Request
   */
  const handleCreatePullRequest = useCallback(async () => {
    try {
      const values = await form.validateFields();
      console.log('Creating pull request:', values);
      message.success('Pull Request创建成功');
      setIsPullRequestModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form]);

  /**
   * 渲染更改列表
   */
  const renderChanges = () => (
    <div className="space-y-4">
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            disabled={selectedChanges.length === 0}
            onClick={() => handleStageChanges(selectedChanges)}
          >
            暂存选中
          </Button>
          <Button
            icon={<CloseOutlined />}
            disabled={selectedChanges.length === 0}
            onClick={() => handleDiscardChanges(selectedChanges)}
          >
            丢弃更改
          </Button>
        </Space>
        
        <Badge count={changes.length} showZero>
          <span className="text-sm text-gray-500">未暂存的更改</span>
        </Badge>
      </div>

      {/* 文件列表 */}
      <div className="border rounded">
        <List
          size="small"
          dataSource={changes}
          renderItem={(change) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedChanges.includes(change.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                const newSelected = selectedChanges.includes(change.id)
                  ? selectedChanges.filter(id => id !== change.id)
                  : [...selectedChanges, change.id];
                setSelectedChanges(newSelected);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(change.status)}
                  <span className="font-medium">{change.fileName}</span>
                  {getStatusTag(change.status)}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {change.additions > 0 && (
                    <span className="text-green-600">+{change.additions}</span>
                  )}
                  {change.deletions > 0 && (
                    <span className="text-red-600">-{change.deletions}</span>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* 提交区域 */}
      <Card size="small" title="提交更改">
        <div className="space-y-3">
          <TextArea
            rows={3}
            placeholder="输入提交消息..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">
              {selectedChanges.length} 个文件已选中
            </span>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              disabled={!commitMessage.trim() || selectedChanges.length === 0}
              onClick={handleCommit}
            >
              提交
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  /**
   * 渲染分支列表
   */
  const renderBranches = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={5}>分支管理</Title>
        <Button
          type="primary"
          icon={<BranchesOutlined />}
          onClick={() => setIsBranchModalVisible(true)}
        >
          新建分支
        </Button>
      </div>

      <List
        dataSource={branches}
        renderItem={(branch) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                disabled={branch.isActive}
                onClick={() => handleSwitchBranch(branch.name)}
              >
                {branch.isActive ? '当前分支' : '切换'}
              </Button>,
              <Button
                type="link"
                size="small"
                icon={<MergeOutlined />}
                disabled={branch.isActive}
                onClick={() => handleMergeBranch(branch.name)}
              >
                合并
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <div className="flex items-center space-x-2">
                  <span className={branch.isActive ? 'font-bold text-blue-600' : ''}>
                    {branch.name}
                  </span>
                  {branch.isActive && <Tag color="blue">当前</Tag>}
                </div>
              }
              description={
                <div className="text-sm text-gray-500">
                  <div>{branch.lastCommit}</div>
                  <div>by {branch.author} · {branch.lastCommitDate}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  /**
   * 渲染提交历史
   */
  const renderHistory = () => (
    <div className="space-y-4">
      <Title level={5}>提交历史</Title>
      
      <Timeline>
        {commits.map((commit) => (
          <Timeline.Item
            key={commit.id}
            dot={<Avatar size="small" icon={<UserOutlined />} />}
          >
            <Card size="small" className="mb-2">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{commit.message}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      by {commit.author} · {commit.date}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {commit.hash}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Tag color="blue">{commit.branch}</Tag>
                  <Button type="link" size="small" icon={<HistoryOutlined />}>
                    查看详情
                  </Button>
                </div>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  /**
   * 渲染Pull Request
   */
  const renderPullRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={5}>Pull Requests</Title>
        <Button
          type="primary"
          icon={<PullRequestOutlined />}
          onClick={() => setIsPullRequestModalVisible(true)}
        >
          创建PR
        </Button>
      </div>

      <List
        dataSource={pullRequests}
        renderItem={(pr) => (
          <List.Item>
            <Card size="small" className="w-full">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{pr.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {pr.description}
                    </div>
                  </div>
                  <Tag 
                    color={
                      pr.status === 'open' ? 'green' : 
                      pr.status === 'merged' ? 'blue' : 'red'
                    }
                  >
                    {pr.status === 'open' ? '开放' : 
                     pr.status === 'merged' ? '已合并' : '已关闭'}
                  </Tag>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>
                      {pr.sourceBranch} → {pr.targetBranch}
                    </span>
                    <span>by {pr.author}</span>
                    <span className="flex items-center space-x-1">
                      <CommentOutlined />
                      <span>{pr.comments}</span>
                    </span>
                  </div>
                  <div>{pr.updatedAt}</div>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><DiffOutlined />更改</span>} key="changes" />
          <TabPane tab={<span><BranchesOutlined />分支</span>} key="branches" />
          <TabPane tab={<span><HistoryOutlined />历史</span>} key="history" />
          <TabPane tab={<span><PullRequestOutlined />PR</span>} key="pullrequests" />
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'changes' && renderChanges()}
        {activeTab === 'branches' && renderBranches()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'pullrequests' && renderPullRequests()}
      </div>

      {/* 创建分支模态框 */}
      <Modal
        title="创建新分支"
        open={isBranchModalVisible}
        onOk={handleCreateBranch}
        onCancel={() => setIsBranchModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="branchName"
            label="分支名称"
            rules={[
              { required: true, message: '请输入分支名称' },
              { pattern: /^[a-zA-Z0-9\-_\/]+$/, message: '分支名称格式不正确' },
            ]}
          >
            <Input placeholder="feature/new-feature" />
          </Form.Item>
          
          <Form.Item
            name="baseBranch"
            label="基于分支"
            initialValue="main"
            rules={[{ required: true, message: '请选择基于的分支' }]}
          >
            <Select>
              {branches.map(branch => (
                <Option key={branch.name} value={branch.name}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建Pull Request模态框 */}
      <Modal
        title="创建Pull Request"
        open={isPullRequestModalVisible}
        onOk={handleCreatePullRequest}
        onCancel={() => setIsPullRequestModalVisible(false)}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入PR标题' }]}
          >
            <Input placeholder="Pull Request标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={4} 
              placeholder="详细描述这个Pull Request的内容和目的" 
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sourceBranch"
              label="源分支"
              rules={[{ required: true, message: '请选择源分支' }]}
            >
              <Select placeholder="选择源分支">
                {branches.map(branch => (
                  <Option key={branch.name} value={branch.name}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="targetBranch"
              label="目标分支"
              initialValue="main"
              rules={[{ required: true, message: '请选择目标分支' }]}
            >
              <Select>
                {branches.map(branch => (
                  <Option key={branch.name} value={branch.name}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GitPanel;