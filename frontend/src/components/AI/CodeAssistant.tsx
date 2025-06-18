import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  List,
  Avatar,
  Tag,
  Space,
  Tooltip,
  Select,
  Slider,
  Switch,
  Divider,
  Progress,
  message,
  Spin,
  Alert,
} from 'antd';
import {
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  CopyOutlined,
  ThumbsUpOutlined,
  ThumbsDownOutlined,
  ReloadOutlined,
  SettingOutlined,
  CodeOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCode?: boolean;
  language?: string;
  suggestions?: CodeSuggestion[];
  confidence?: number;
}

interface CodeSuggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'optimization';
  title: string;
  description: string;
  code: string;
  language: string;
  confidence: number;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  autoComplete: boolean;
  contextAware: boolean;
  includeComments: boolean;
}

/**
 * AI代码助手组件
 * 提供智能代码补全、重构建议和问题解答
 */
const CodeAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '你好！我是CloudDev AI代码助手。我可以帮助你：\n\n• 代码补全和生成\n• 代码重构建议\n• Bug修复建议\n• 代码优化\n• 技术问题解答\n\n请告诉我你需要什么帮助！',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [showSettings, setShowSettings] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  
  const [settings, setSettings] = useState<AISettings>({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    autoComplete: true,
    contextAware: true,
    includeComments: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // 模拟代码建议
  const mockSuggestions: CodeSuggestion[] = [
    {
      id: '1',
      type: 'completion',
      title: '函数补全建议',
      description: '为用户认证函数添加错误处理',
      code: `async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await userService.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('密码错误');
    }
    
    return user;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}`,
      language: 'typescript',
      confidence: 92,
    },
    {
      id: '2',
      type: 'optimization',
      title: '性能优化建议',
      description: '使用React.memo优化组件性能',
      code: `const UserProfile = React.memo(({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // 使用useCallback防止不必要的重渲染
  const handleSave = useCallback((userData) => {
    onUpdate(userData);
    setIsEditing(false);
  }, [onUpdate]);
  
  return (
    <div className="user-profile">
      {/* 组件内容 */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.user.id === nextProps.user.id &&
         prevProps.user.updatedAt === nextProps.user.updatedAt;
});`,
      language: 'javascript',
      confidence: 88,
    },
    {
      id: '3',
      type: 'fix',
      title: 'Bug修复建议',
      description: '修复内存泄漏问题',
      code: `useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    try {
      const response = await api.getData();
      // 检查组件是否仍然挂载
      if (isMounted) {
        setData(response.data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error.message);
      }
    }
  };
  
  fetchData();
  
  // 清理函数
  return () => {
    isMounted = false;
  };
}, []);`,
      language: 'javascript',
      confidence: 95,
    },
  ];

  /**
   * 发送消息
   */
  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentInput),
        timestamp: new Date().toLocaleTimeString(),
        confidence: Math.floor(Math.random() * 20) + 80,
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      setSuggestions(mockSuggestions);
    }, 1500);
  }, [currentInput]);

  /**
   * 生成AI响应（模拟）
   */
  const generateAIResponse = useCallback((input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('bug') || lowercaseInput.includes('错误')) {
      return '我分析了你的代码，发现可能存在以下问题：\n\n1. **内存泄漏**: useEffect缺少清理函数\n2. **类型安全**: 某些变量缺少类型声明\n3. **错误处理**: 异步操作缺少try-catch\n\n我已经在右侧生成了修复建议，你可以查看并应用。';
    } else if (lowercaseInput.includes('优化') || lowercaseInput.includes('性能')) {
      return '基于你的代码，我建议以下优化措施：\n\n• **React优化**: 使用React.memo和useCallback\n• **代码分割**: 实现懒加载\n• **缓存策略**: 添加适当的缓存\n• **包大小**: 移除未使用的依赖\n\n具体的代码实现我已经准备好了，请查看建议面板。';
    } else if (lowercaseInput.includes('函数') || lowercaseInput.includes('方法')) {
      return '我可以帮你生成一个高质量的函数。请告诉我：\n\n1. 函数的具体功能\n2. 输入参数类型\n3. 返回值要求\n4. 是否需要异步处理\n\n我会为你生成完整的、类型安全的函数实现。';
    } else {
      return '我理解你的需求。让我为你分析一下：\n\n这是一个很好的问题！根据最佳实践，我建议：\n\n• 保持代码简洁和可读性\n• 添加适当的错误处理\n• 使用TypeScript提供类型安全\n• 编写单元测试\n\n需要我为你生成具体的代码示例吗？';
    }
  }, []);

  /**
   * 复制代码
   */
  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  }, []);

  /**
   * 应用建议
   */
  const handleApplySuggestion = useCallback((suggestion: CodeSuggestion) => {
    if (editorRef.current) {
      editorRef.current.setValue(suggestion.code);
      message.success('建议已应用到编辑器');
    }
  }, []);

  /**
   * 获取建议类型图标
   */
  const getSuggestionIcon = useCallback((type: string) => {
    switch (type) {
      case 'completion': return <CodeOutlined className="text-blue-500" />;
      case 'optimization': return <BulbOutlined className="text-yellow-500" />;
      case 'fix': return <CheckCircleOutlined className="text-green-500" />;
      case 'refactor': return <ReloadOutlined className="text-purple-500" />;
      default: return <QuestionCircleOutlined className="text-gray-500" />;
    }
  }, []);

  /**
   * 滚动到底部
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex space-x-4">
      {/* 左侧聊天面板 */}
      <div className="w-1/2 flex flex-col">
        <Card 
          title="AI代码助手" 
          className="flex-1 flex flex-col"
          extra={
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(!showSettings)}
            />
          }
        >
          {/* 设置面板 */}
          {showSettings && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <Title level={5}>AI设置</Title>
              <div className="space-y-3">
                <div>
                  <Text>模型选择:</Text>
                  <Select 
                    value={settings.model} 
                    onChange={(value) => setSettings(prev => ({ ...prev, model: value }))}
                    className="w-full mt-1"
                  >
                    <Option value="gpt-4">GPT-4 (最佳质量)</Option>
                    <Option value="gpt-3.5">GPT-3.5 (更快响应)</Option>
                    <Option value="codex">Codex (专注代码)</Option>
                  </Select>
                </div>
                
                <div>
                  <Text>创造性 (Temperature): {settings.temperature}</Text>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={settings.temperature}
                    onChange={(value) => setSettings(prev => ({ ...prev, temperature: value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text>自动补全</Text>
                    <Switch 
                      checked={settings.autoComplete}
                      onChange={(checked) => setSettings(prev => ({ ...prev, autoComplete: checked }))}
                      className="ml-2"
                    />
                  </div>
                  <div>
                    <Text>上下文感知</Text>
                    <Switch 
                      checked={settings.contextAware}
                      onChange={(checked) => setSettings(prev => ({ ...prev, contextAware: checked }))}
                      className="ml-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <Avatar 
                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className={message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'}
                  />
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100'
                  }`}>
                    <Paragraph 
                      className={`mb-1 ${message.type === 'user' ? 'text-white' : ''}`}
                      style={{ marginBottom: 4 }}
                    >
                      {message.content}
                    </Paragraph>
                    <div className="flex items-center justify-between">
                      <Text 
                        type="secondary" 
                        className={`text-xs ${message.type === 'user' ? 'text-blue-100' : ''}`}
                      >
                        {message.timestamp}
                      </Text>
                      {message.confidence && (
                        <div className="flex items-center space-x-2">
                          <Text 
                            type="secondary" 
                            className="text-xs"
                          >
                            置信度: {message.confidence}%
                          </Text>
                          <Space size="small">
                            <Button 
                              type="text" 
                              size="small" 
                              icon={<ThumbsUpOutlined />}
                            />
                            <Button 
                              type="text" 
                              size="small" 
                              icon={<ThumbsDownOutlined />}
                            />
                          </Space>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <Avatar icon={<RobotOutlined />} className="bg-green-500" />
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Spin size="small" />
                    <Text className="ml-2">AI正在思考...</Text>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="space-y-2">
            {selectedCode && (
              <Alert
                message="已选择代码"
                description={`${selectedCode.length} 字符的${currentLanguage}代码`}
                type="info"
                showIcon
                closable
                onClose={() => setSelectedCode('')}
              />
            )}
            
            <div className="flex space-x-2">
              <TextArea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="输入你的问题或选择代码后询问..."
                rows={3}
                onPressEnter={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex flex-col space-y-2">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isLoading}
                />
                <Select
                  value={currentLanguage}
                  onChange={setCurrentLanguage}
                  size="small"
                >
                  <Option value="javascript">JavaScript</Option>
                  <Option value="typescript">TypeScript</Option>
                  <Option value="python">Python</Option>
                  <Option value="java">Java</Option>
                  <Option value="go">Go</Option>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 右侧代码和建议面板 */}
      <div className="w-1/2 flex flex-col space-y-4">
        {/* 代码编辑器 */}
        <Card title="代码编辑器" className="flex-1">
          <Editor
            height="300px"
            language={currentLanguage}
            theme="vs-light"
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidChangeModelContent(() => {
                const selection = editor.getSelection();
                if (selection && !selection.isEmpty()) {
                  const selectedText = editor.getModel()?.getValueInRange(selection);
                  if (selectedText) {
                    setSelectedCode(selectedText);
                  }
                }
              });
            }}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Card>

        {/* AI建议面板 */}
        <Card title="AI建议" className="flex-1">
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card 
                  key={suggestion.id}
                  size="small"
                  className="border border-gray-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSuggestionIcon(suggestion.type)}
                        <Text strong>{suggestion.title}</Text>
                        <Tag color="blue">{suggestion.language}</Tag>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          type="circle" 
                          percent={suggestion.confidence} 
                          width={30}
                          format={(percent) => `${percent}%`}
                        />
                      </div>
                    </div>
                    
                    <Text type="secondary" className="text-sm">
                      {suggestion.description}
                    </Text>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-sm overflow-auto">
                        <code>{suggestion.code}</code>
                      </pre>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyCode(suggestion.code)}
                      >
                        复制
                      </Button>
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        应用
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <RobotOutlined className="text-4xl mb-4" />
              <div>暂无AI建议</div>
              <div className="text-sm">选择代码或提出问题来获取智能建议</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CodeAssistant;