import React, { useCallback } from "react";
import type { LucideIcon } from "lucide-react";

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
  onFocus,
  onClick,
  type = "text",
  ...props
}) => {
  const triggerDatePicker = useCallback((target: HTMLInputElement) => {
    if (type === "date" && typeof target.showPicker === "function") {
      try {
        target.showPicker();
      } catch {
        // ignore failures to open the native picker
      }
    }
  }, [type]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    triggerDatePicker(event.currentTarget);
    onFocus?.(event);
  }, [onFocus, triggerDatePicker]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLInputElement>) => {
    triggerDatePicker(event.currentTarget);
    onClick?.(event);
  }, [onClick, triggerDatePicker]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <Icon
            className="absolute text-gray-400 dark:text-gray-500 transform -translate-y-1/2 left-3 top-1/2"
            size={20}
          />
        )}
        <input
          className={`
            w-full px-3 py-3 border-2 rounded-xl transition-all duration-200 font-medium text-sm
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043]
            dark:focus:ring-[#18D043]/30 dark:focus:border-[#18D043]
            ${
              error
                ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }
            ${Icon && iconPosition === "left" ? "pl-11" : ""}
            ${Icon && iconPosition === "right" ? "pr-11" : ""}
            ${className}
          `}
          type={type}
          onFocus={handleFocus}
          onClick={handleClick}
          {...props}
        />
        {Icon && iconPosition === "right" && (
          <Icon
            className="absolute text-gray-400 dark:text-gray-500 transform -translate-y-1/2 right-3 top-1/2"
            size={20}
          />
        )}
      </div>
      {error && (
        <p className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="text-gray-400">💡</span>
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};
