import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Buscar y seleccionar...",
  label,
  error,
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Input principal */}
        <div
          className={`relative w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium cursor-pointer
            ${
              error
                ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20"
                : "border-gray-200 hover:border-gray-300 focus-within:border-[#18D043] focus-within:ring-[#18D043]/20"
            }
            ${isOpen ? "ring-2" : ""}
          `}
          onClick={handleInputClick}
        >
          <div className="flex items-center">
            <span className="mr-3 text-gray-400">🔍</span>

            {/* Mostrar valor seleccionado o input de búsqueda */}
            {value && !isOpen ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-gray-900">{value}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                  <span
                    className={`text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={value || placeholder}
                  className="flex-1 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none"
                />
                <span
                  className={`text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-xl max-h-60">
            {searchTerm && (
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                {filteredOptions.length} resultado
                {filteredOptions.length !== 1 ? "s" : ""} encontrado
                {filteredOptions.length !== 1 ? "s" : ""}
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="mb-2">🔍</div>
                <div className="font-medium">No se encontraron resultados</div>
                <div className="text-xs">
                  Intenta con otro término de búsqueda
                </div>
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={option}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center
                      ${
                        index === highlightedIndex
                          ? "bg-[#18D043]/10 text-[#16a34a]"
                          : "hover:bg-gray-50 text-gray-900"
                      }
                    `}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option}</span>
                      {value === option && (
                        <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center mt-2 space-x-1 text-sm text-red-600">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};