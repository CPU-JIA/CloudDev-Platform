import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Result, Button, Typography, Card } from 'antd';
import { BugOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 用于捕获和处理React组件树中的JavaScript错误
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state以便下一次渲染能够显示降级后的UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 在这里可以将错误信息发送到错误监控服务
    this.reportError(error, errorInfo);
  }

  /**
   * 报告错误到监控服务
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // 这里可以集成Sentry、LogRocket等错误监控服务
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous',
      };

      // 发送错误报告（示例）
      console.log('Error report:', errorReport);
      
      // 实际项目中可以这样发送：
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  /**
   * 重新加载页面
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 复制错误信息到剪贴板
   */
  private handleCopyError = async () => {
    if (this.state.error && this.state.errorInfo) {
      const errorText = `
错误信息: ${this.state.error.message}
错误堆栈: ${this.state.error.stack}
组件堆栈: ${this.state.errorInfo.componentStack}
时间: ${new Date().toISOString()}
URL: ${window.location.href}
      `.trim();

      try {
        await navigator.clipboard.writeText(errorText);
        console.log('错误信息已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // 使用自定义fallback或默认错误UI
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // 默认错误UI
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f5f5f5',
          padding: '20px'
        }}>
          <Card style={{ maxWidth: 600, width: '100%' }}>
            <Result
              status="error"
              icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
              title="应用发生错误"
              subTitle="很抱歉，应用遇到了一个意外错误。请尝试刷新页面或联系技术支持。"
              extra={[
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={this.handleReload}
                  key="reload"
                >
                  刷新页面
                </Button>,
                <Button 
                  icon={<HomeOutlined />} 
                  onClick={this.handleGoHome}
                  key="home"
                >
                  返回首页
                </Button>,
                <Button 
                  onClick={this.handleReset}
                  key="reset"
                >
                  重试
                </Button>,
              ]}
            >
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div style={{ textAlign: 'left', marginTop: 24 }}>
                  <Typography>
                    <Paragraph strong>错误详情（仅开发环境显示）:</Paragraph>
                    <Paragraph>
                      <Text code>{this.state.error.message}</Text>
                    </Paragraph>
                    
                    <details style={{ marginTop: 16 }}>
                      <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                        <Text strong>错误堆栈</Text>
                      </summary>
                      <pre style={{ 
                        background: '#f6f8fa',
                        padding: 12,
                        borderRadius: 4,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 200
                      }}>
                        {this.state.error.stack}
                      </pre>
                    </details>

                    {this.state.errorInfo && (
                      <details style={{ marginTop: 16 }}>
                        <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                          <Text strong>组件堆栈</Text>
                        </summary>
                        <pre style={{ 
                          background: '#f6f8fa',
                          padding: 12,
                          borderRadius: 4,
                          fontSize: 12,
                          overflow: 'auto',
                          maxHeight: 200
                        }}>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <Button 
                        size="small" 
                        onClick={this.handleCopyError}
                        type="dashed"
                      >
                        复制错误信息
                      </Button>
                    </div>
                  </Typography>
                </div>
              )}
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;