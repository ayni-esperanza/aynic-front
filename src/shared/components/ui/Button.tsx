import React from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#18D043] to-[#16a34a] text-white hover:from-[#16a34a] hover:to-[#15803d] focus:ring-[#18D043]/20 dark:focus:ring-[#18D043]/30 shadow-lg hover:shadow-xl shadow-[#18D043]/25 dark:shadow-[#18D043]/40",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 focus:ring-gray-500/20 dark:focus:ring-gray-400/30 shadow-sm hover:shadow-md",
    outline:
      "border-2 border-[#18D043] dark:border-[#18D043] text-[#18D043] dark:text-[#18D043] hover:bg-[#18D043] hover:text-white dark:hover:bg-[#18D043] dark:hover:text-white focus:ring-[#18D043]/20 dark:focus:ring-[#18D043]/30 shadow-sm hover:shadow-lg",
    ghost:
      "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 focus:ring-gray-500/20 dark:focus:ring-gray-400/30 rounded-lg",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white hover:from-red-700 hover:to-red-800 dark:hover:from-red-800 dark:hover:to-red-900 focus:ring-red-500/20 dark:focus:ring-red-400/30 shadow-lg hover:shadow-xl shadow-red-600/25 dark:shadow-red-700/40",
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
      )}
      {Icon && iconPosition === "left" && !loading && (
        <Icon size={size === "lg" ? 20 : 16} />
      )}
      {children}
      {Icon && iconPosition === "right" && !loading && (
        <Icon size={size === "lg" ? 20 : 16} />
      )}
    </button>
  );
};