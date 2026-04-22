// @ts-nocheck
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMsg: ''
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Um erro ocorreu na camada React:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
          return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-tulip-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-sm text-center">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
             </div>
             <h2 className="text-xl font-bold text-tulip-900 mb-2">Ops! Algo deu errado</h2>
             <p className="text-sm text-zinc-500 mb-6">Pedimos desculpa, mas a aplicação encontrou um problema ao carregar.</p>
             <button 
               onClick={() => window.location.reload()}
               className="bg-tulip-600 hover:bg-tulip-700 text-white font-medium py-3 px-6 rounded-xl w-full"
             >
               Recarregar a página
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
