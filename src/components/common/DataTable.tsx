import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import type { TableColumn } from '../../types';
import { Button } from '../ui/Button';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// Componente de fila memorizado para evitar re-renders innecesarios
const TableRow = React.memo(<T extends Record<string, any>>({
  item,
  columns,
  index,
}: {
  item: T;
  columns: TableColumn<T>[];
  index: number;
}) => (
  <tr key={index} className="transition-colors hover:bg-gray-50">
    {columns.map((column) => (
      <td key={String(column.key)} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
        {column.render 
          ? column.render(item[column.key], item)
          : String(item[column.key] || '-')
        }
      </td>
    ))}
  </tr>
));

// Componente de botones de paginación memorizado
const PaginationButtons = React.memo(({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const buttons = useMemo(() => {
    const buttonList = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttonList.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            i === currentPage
              ? 'bg-[#18D043] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttonList;
  }, [currentPage, totalPages, onPageChange]);

  return <div className="flex space-x-1">{buttons}</div>;
});

export const DataTable = React.memo(<T extends Record<string, any>>({
  data,
  columns,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
}: DataTableProps<T>) => {
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((column: keyof T) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Memoizar las filas de la tabla
  const tableRows = useMemo(() => 
    data.map((item, index) => (
      <TableRow
        key={`${item.id || index}`}
        item={item}
        columns={columns}
        index={index}
      />
    )), [data, columns]);

  // Memoizar información de paginación
  const paginationInfo = useMemo(() => ({
    start: Math.min((currentPage - 1) * 10 + 1, totalItems),
    end: Math.min(currentPage * 10, totalItems),
    total: totalItems,
  }), [currentPage, totalItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width ? `w-${column.width}` : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableRows}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {paginationInfo.start} a {paginationInfo.end} de {paginationInfo.total} registros
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            icon={ChevronLeft}
          >
            Anterior
          </Button>
          
          <PaginationButtons
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            icon={ChevronRight}
            iconPosition="right"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
});