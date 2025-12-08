import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  size?: "default" | "compact";
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Buscar y seleccionar...",
  label,
  error,
  required = false,
  className = "",
  size = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelectOption(filteredOptions[highlightedIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  const handleInputClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setHighlightedIndex(-1);
    onSearch?.(term);
    if (!isOpen) setIsOpen(true);
  };

  const sizeConfig = {
    default: {
      wrapper: "px-3 py-3 text-sm min-h-[48px]",
      value: "text-sm",
      input: "text-sm",
      icon: "text-xs",
      option: "text-sm",
      meta: "text-xs",
    },
    compact: {
      wrapper: "px-3 py-2.5 text-sm min-h-[44px]",
      value: "text-sm",
      input: "text-sm",
      icon: "text-xs",
      option: "text-sm",
      meta: "text-xs",
    },
  } as const;

  const currentSize = sizeConfig[size];
  const showStaticDisplay = !isOpen;

  return (
    <div className="relative w-full min-w-0">
      {label && (
        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <div
          className={`relative w-full min-w-0 border-2 rounded-xl transition-all duration-200 font-medium cursor-pointer bg-white dark:bg-gray-800 flex items-center ${currentSize.wrapper} ${className} ${
            error
              ? "border-red-300 dark:border-red-600 focus-within:border-red-500 focus-within:ring-red-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus-within:border-[#18D043] focus-within:ring-[#18D043]/20 dark:focus-within:ring-[#18D043]/30"
          }`}
          onClick={handleInputClick}
        >
          <div className="flex items-center min-w-0 w-full h-full">
            {showStaticDisplay ? (
              <div className="flex items-center justify-between w-full min-w-0 gap-2 h-full">
                <span
                  className={`truncate leading-none ${currentSize.value} ${
                    value
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {value || placeholder}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {value && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300 flex items-center"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <span
                    className={`text-gray-400 dark:text-gray-500 transition-transform leading-none ${currentSize.meta} ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full min-w-0 gap-2 h-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={value || placeholder}
                  className={`flex-1 min-w-0 h-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent border-none outline-none leading-none ${currentSize.input}`}
                />
                <span
                  className={`text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 leading-none ${currentSize.meta} ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl max-h-60">
            {searchTerm && (
              <div className={`px-4 py-2 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 ${currentSize.meta}`}>
                {filteredOptions.length} resultado
                {filteredOptions.length !== 1 ? "s" : ""} encontrado
                {filteredOptions.length !== 1 ? "s" : ""}
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="mb-2">🔍</div>
                <div className="font-medium">No se encontraron resultados</div>
                <div className="text-xs">Intenta con otro término de búsqueda</div>
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={option}
                    className={`px-3 py-1.5 cursor-pointer transition-colors flex items-center ${currentSize.option} ${
                      index === highlightedIndex
                        ? "bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043]"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium truncate">{option}</span>
                      {value === option && <div className="w-1.5 h-1.5 ml-2 bg-[#18D043] rounded-full flex-shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center mt-2 space-x-1 text-sm text-red-600 dark:text-red-400">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
