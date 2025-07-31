import { DivideIcon as LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = "left",
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <Icon
            className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
            size={20}
          />
        )}
        <input
          className={`
            w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium
            focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043]
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 hover:border-gray-300"
            }
            ${Icon && iconPosition === "left" ? "pl-11" : ""}
            ${Icon && iconPosition === "right" ? "pr-11" : ""}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <Icon
            className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2"
            size={20}
          />
        )}
      </div>
      {error && (
        <p className="flex items-center space-x-1 text-sm text-red-600">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="flex items-center space-x-1 text-sm text-gray-500">
          <span className="text-gray-400">💡</span>
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};
