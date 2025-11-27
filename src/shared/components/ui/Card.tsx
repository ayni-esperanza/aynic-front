interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  hover = false,
  gradient = false,
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = `bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
    hover ? "hover:shadow-lg hover:scale-[1.02] hover:border-[#18D043]/20 dark:hover:border-[#18D043]/30" : ""
  } ${gradient ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" : ""}`;

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};