import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Typography,
  Space,
  Divider,
  Alert,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  GithubOutlined,
  GitlabOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';

import { AppDispatch } from '../../store';
import { login, selectIsLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import type { LoginRequest } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const { Title, Text, Paragraph } = Typography;

interface LocationState {
  from: Location;
}

/**
 * 登录页面组件
 */
const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  // 获取重定向路径
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // 清除之前的错误
    dispatch(clearError());
    
    // 处理OAuth回调
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider');
    
    if (code && provider) {
      handleOAuthCallback(provider, code, state);
    }
  }, [dispatch, location]);

  /**
   * 处理OAuth回调
   */
  const handleOAuthCallback = async (provider: string, code: string, state: string | null) => {
    try {
      const response = await authService.handleOAuthCallback(provider, code, state || undefined);
      
      // 存储token
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      message.success('登录成功！');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      message.error('OAuth登录失败，请重试');
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: LoginRequest) => {
    try {
      const result = await dispatch(login({ ...values, rememberMe }));
      
      if (login.fulfilled.match(result)) {
        message.success('登录成功！');
        navigate(from, { replace: true });
      }
    } catch (error) {
      // 错误处理已在authSlice中进行
      console.error('Login error:', error);
    }
  };

  /**
   * OAuth登录
   */
  const handleOAuthLogin = (provider: 'google' | 'github' | 'gitlab') => {
    const oauthUrl = authService.getOAuthLoginUrl(provider);
    window.location.href = oauthUrl;
  };

  /**
   * 忘记密码
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
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
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
            CloudDev Platform
          </Title>
          <Paragraph type="secondary">
            登录到您的开发协作平台
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

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名或邮箱' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="用户名或邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="密码"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                记住我
              </Checkbox>
              <Button
                type="link"
                onClick={handleForgotPassword}
                style={{ padding: 0 }}
              >
                忘记密码？
              </Button>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* OAuth登录 */}
        <Divider>
          <Text type="secondary">或使用以下方式登录</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={() => handleOAuthLogin('google')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            使用 Google 登录
          </Button>
          
          <Button
            block
            size="large"
            icon={<GithubOutlined />}
            onClick={() => handleOAuthLogin('github')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            使用 GitHub 登录
          </Button>
          
          <Button
            block
            size="large"
            icon={<GitlabOutlined />}
            onClick={() => handleOAuthLogin('gitlab')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            使用 GitLab 登录
          </Button>
        </Space>

        {/* 注册链接 */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">
            还没有账户？{' '}
            <Link to="/register" style={{ color: '#1890ff' }}>
              立即注册
            </Link>
          </Text>
        </div>

        {/* 帮助信息 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            登录即表示您同意我们的{' '}
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

export default Login;