import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090A0D] text-[#F3F1EC] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#111319] border border-[#22252E] rounded-lg p-8 space-y-4">
            <p className="text-xs font-medium text-[#C9A86A]">Rule One · System Recovery</p>
            <h1 className="font-display text-2xl font-semibold text-[#F3F1EC]">
              Something went wrong
            </h1>
            <p className="text-sm text-[#A8A59E] break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="px-4 py-2 text-xs font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
