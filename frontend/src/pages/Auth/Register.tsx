import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Progress,
  Tooltip,
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

import { AppDispatch } from '../../store';
import { register, selectIsLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import type { RegisterRequest } from '../../store/slices/authSlice';

const { Title, Paragraph, Text } = Typography;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

/**
 * 注册页面组件
 */
const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '弱',
    color: '#ff4d4f'
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * 计算密码强度
   */
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    // 长度检查
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // 复杂性检查
    if (password.length >= 10 && /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      score += 1;
    }

    let label = '弱';
    let color = '#ff4d4f';
    
    if (score >= 6) {
      label = '强';
      color = '#52c41a';
    } else if (score >= 4) {
      label = '中等';
      color = '#faad14';
    } else if (score >= 2) {
      label = '一般';
      color = '#ff7a45';
    }

    return { score: Math.min(score * 15, 100), label, color };
  };

  /**
   * 密码变化处理
   */
  const handlePasswordChange = (value: string) => {
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  /**
   * 表单提交处理
   */
  const handleSubmit = async (values: RegisterRequest) => {
    try {
      const result = await dispatch(register(values));
      
      if (register.fulfilled.match(result)) {
        message.success('注册成功！请前往登录');
        navigate('/login');
      }
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  /**
   * 用户名验证
   */
  const validateUsername = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'));
    }
    if (value.length < 3) {
      return Promise.reject(new Error('用户名至少3个字符'));
    }
    if (value.length > 20) {
      return Promise.reject(new Error('用户名不能超过20个字符'));
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return Promise.reject(new Error('用户名只能包含字母、数字、下划线和横线'));
    }
    return Promise.resolve();
  };

  /**
   * 邮箱验证
   */
  const validateEmail = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入邮箱地址'));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject(new Error('请输入有效的邮箱地址'));
    }
    return Promise.resolve();
  };

  /**
   * 密码验证
   */
  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入密码'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('密码至少8个字符'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
      return Promise.reject(new Error('密码必须包含大小写字母和数字'));
    }
    return Promise.resolve();
  };

  /**
   * 确认密码验证
   */
  const validateConfirmPassword = (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (!value) {
      return Promise.reject(new Error('请确认密码'));
    }
    if (value !== password) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
            注册账户
          </Title>
          <Paragraph type="secondary">
            创建您的CloudDev Platform账户
          </Paragraph>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 注册表单 */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ validator: validateUsername }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ validator: validateEmail }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="邮箱地址"
              size="large"
              type="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="密码"
              size="large"
              onChange={(e) => handlePasswordChange(e.target.value)}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {/* 密码强度指示器 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                密码强度
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: passwordStrength.color,
                  fontWeight: 500,
                }}
              >
                {passwordStrength.label}
              </Text>
            </div>
            <Progress
              percent={passwordStrength.score}
              showInfo={false}
              strokeColor={passwordStrength.color}
              trailColor="#f0f0f0"
              size="small"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                密码要求：至少8个字符，包含大小写字母、数字
              </Text>
            </div>
          </div>

          <Form.Item
            name="confirmPassword"
            rules={[{ validator: validateConfirmPassword }]}
            dependencies={['password']}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="确认密码"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        {/* 注册须知 */}
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="注册须知"
            description={
              <div>
                <div style={{ marginBottom: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                  注册后您将获得免费的开发环境
                </div>
                <div style={{ marginBottom: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                  支持多人实时协作编程
                </div>
                <div>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                  完整的CI/CD流水线支持
                </div>
              </div>
            }
            type="info"
            showIcon={false}
          />
        </div>

        {/* 登录链接 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            已有账户？{' '}
            <Link to="/login" style={{ color: '#1890ff' }}>
              立即登录
            </Link>
          </Text>
        </div>

        {/* 服务条款 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            注册即表示您同意我们的{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              服务条款
            </a>{' '}
            和{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              隐私政策
            </a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;