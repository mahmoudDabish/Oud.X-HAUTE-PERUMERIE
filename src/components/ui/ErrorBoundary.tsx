import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import i18n from '../../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  public state: State = {
    hasError: false,
    error: null
  };
  declare setState: (state: Partial<State>) => void;

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OUD.X Client Error Caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070707] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-8 sm:p-10 rounded-2xl bg-[#0D0C0A] border border-[#C9A45C]/35 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top Amber Highlight */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />
            
            <div className="w-16 h-16 rounded-full bg-[#151310] border border-[#C9A45C]/40 mx-auto flex items-center justify-center text-[#E3C27A]">
              <ShieldAlert className="w-8 h-8 text-[#C9A45C]" />
            </div>

            <div className="space-y-2">
              <span className="font-cinzel text-xs uppercase tracking-[3px] text-[#C9A45C] font-semibold">
                {i18n.t('errorBoundary.prive', 'OUD_X PRIVÉ')}
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EA]">
                {i18n.t('errorBoundary.title', 'An Unexpected Exception Occurred')}
              </h2>
              <p className="text-xs text-[#A7A29A] leading-relaxed">
                {i18n.t('errorBoundary.desc', 'Our atelier encountered an unexpected state. Your shopping cart and preferences remain safely stored.')}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-full bg-[#C9A45C] hover:bg-[#E3C27A] text-[#070707] font-bold text-xs uppercase tracking-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 rtl-flip" /> {i18n.t('errorBoundary.reload', 'Reload')}
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-full bg-transparent border border-[#C9A45C]/40 hover:bg-[#C9A45C]/10 text-[#C9A45C] font-semibold text-xs uppercase tracking-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> {i18n.t('errorBoundary.boutique', 'Boutique')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
