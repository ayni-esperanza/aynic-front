interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 dark:focus:ring-[#18D043]/30 focus:border-[#18D043]
          ${
            error
              ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};