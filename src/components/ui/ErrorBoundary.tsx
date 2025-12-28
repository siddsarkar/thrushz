import { Component, PropsWithChildren } from 'react';
import { Text } from 'react-native';

export class ErrorBoundary extends Component<
  PropsWithChildren<{ fallback: React.ReactNode }>,
  { hasError: boolean }
> {
  constructor(props: PropsWithChildren<{ fallback: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <Text>Something went wrong.</Text>;
    }
    return this.props.children;
  }
}
