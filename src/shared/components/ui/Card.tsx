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
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const baseClasses = `bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${
    hover ? "hover:shadow-lg hover:scale-[1.02] hover:border-[#18D043]/20" : ""
  } ${gradient ? "bg-gradient-to-br from-white to-gray-50" : ""}`;

  return (
    <div className={`${baseClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};