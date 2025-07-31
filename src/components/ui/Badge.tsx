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
      "bg-gradient-to-r from-[#18D043]/10 to-green-100 text-[#16a34a] border border-[#18D043]/20",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300",
    success:
      "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300",
    warning:
      "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300",
    danger:
      "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-300",
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