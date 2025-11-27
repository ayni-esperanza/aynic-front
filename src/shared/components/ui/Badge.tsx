interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "secondary",
  size = "sm",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center font-semibold rounded-full transition-all duration-200 transform hover:scale-105";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#18D043]/10 to-green-100 dark:from-[#18D043]/20 dark:to-green-900/30 text-[#16a34a] dark:text-[#18D043] border border-[#18D043]/20 dark:border-[#18D043]/30",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
    success:
      "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
    warning:
      "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
    danger:
      "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};