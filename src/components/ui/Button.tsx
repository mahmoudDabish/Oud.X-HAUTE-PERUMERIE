import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-sans-clean font-bold tracking-[2px] uppercase transition-all duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C9A45C]/50 rounded-full";

  const sizeStyles = {
    sm: "text-[10px] px-4 py-2 gap-1.5",
    md: "text-xs px-6 py-3 gap-2",
    lg: "text-xs px-8 py-4 gap-2.5 tracking-[2.5px]"
  };

  const variantStyles = {
    primary: "bg-[#C9A45C] text-[#070707] hover:bg-[#E3C27A] active:bg-[#B38F48] shadow-lg shadow-[#C9A45C]/15 hover:shadow-[#C9A45C]/30 border border-[#C9A45C]",
    secondary: "bg-[#151310]/60 backdrop-blur-md text-[#F0D9A4] border border-[#C9A45C]/40 hover:border-[#C9A45C] hover:bg-[#C9A45C]/10 active:bg-[#C9A45C]/20",
    ghost: "bg-transparent text-[#A7A29A] hover:text-[#F5F2EA] hover:bg-white/5 active:bg-white/10 border border-transparent",
    danger: "bg-red-950/50 text-red-300 border border-red-800/50 hover:bg-red-900/50 backdrop-blur-sm"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
