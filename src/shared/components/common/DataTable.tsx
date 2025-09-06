import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";
import type { TableColumn } from "../../types";
import { Button } from "../ui/Button";

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  onSort?: (column: keyof T, direction: "asc" | "desc") => void;
  sortColumn?: keyof T;
  sortDirection?: "asc" | "desc";
  stickyHeader?: boolean;
  headerOffset?: number;
  maxBodyHeight?: string;
}

// Fila de la tabla
const TableRow = <T extends Record<string, unknown>>({
  item,
  columns,
  index,
  isEven,
}: {
  item: T;
  columns: TableColumn<T>[];
  index: number;
  isEven: boolean;
}) => (
  <tr
    key={index}
    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-[#18D043]/5 hover:to-green-50 hover:shadow-sm group ${
      isEven ? "bg-gray-50/50" : "bg-white"
    }`}
  >
    {columns.map((column, colIndex) => {
      try {
        return (
          <td
            key={String(column.key)}
            className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap transition-all duration-200 group-hover:scale-[1.02] ${
              colIndex === 0 ? "font-medium text-gray-900" : "text-gray-700"
            } ${column.width ? String(column.width) : ""}`}
          >
            {column.render
              ? column.render((item as any)[column.key], item)
              : String(((item as any)[column.key] as any) ?? "-")}
          </td>
        );
      } catch (error) {
        console.warn(`Error rendering column ${String(column.key)}:`, error);
        return (
          <td
            key={String(column.key)}
            className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
          >
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
              Error
            </span>
          </td>
        );
      }
    })}
  </tr>
);

// Botones de paginación
const PaginationButtons = React.memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    const buttons = useMemo(() => {
      const buttonList: React.ReactNode[] = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      if (startPage > 1) {
        buttonList.push(
          <button
            type="button"
            key="first"
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:scale-105"
          >
            1
          </button>
        );
        if (startPage > 2) {
          buttonList.push(
            <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
              <MoreHorizontal size={16} />
            </span>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        buttonList.push(
          <button
            type="button"
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
              i === currentPage
                ? "bg-gradient-to-r from-[#18D043] to-[#16a34a] text-white shadow-lg shadow-[#18D043]/25"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttonList.push(
            <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
              <MoreHorizontal size={16} />
            </span>
          );
        }
        buttonList.push(
          <button
            type="button"
            key="last"
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:scale-105"
          >
            {totalPages}
          </button>
        );
      }

      return buttonList;
    }, [currentPage, totalPages, onPageChange]);

    return <div className="flex items-center space-x-1">{buttons}</div>;
  }
);

export const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
  onSort,
  sortColumn,
  sortDirection,
  stickyHeader = true,
  headerOffset = 0,
  maxBodyHeight = "60vh",
}: DataTableProps<T>) => {
  const [localSortBy, setLocalSortBy] = useState<keyof T | null>(
    (sortColumn as keyof T) || null
  );
  const [localSortOrder, setLocalSortOrder] = useState<"asc" | "desc">(
    sortDirection || "asc"
  );

  useEffect(() => {
    setLocalSortBy((sortColumn as keyof T) || null);
  }, [sortColumn]);

  useEffect(() => {
    if (sortDirection) setLocalSortOrder(sortDirection);
  }, [sortDirection]);

  const handleSort = useCallback(
    (column: keyof T) => {
      const colCfg = columns.find((col) => col.key === (column as any));
      if (!colCfg?.sortable) return;

      let newSortOrder: "asc" | "desc" = "asc";
      if (localSortBy === column) {
        newSortOrder = localSortOrder === "asc" ? "desc" : "asc";
      }

      setLocalSortBy(column);
      setLocalSortOrder(newSortOrder);
      onSort && onSort(column, newSortOrder);
    },
    [localSortBy, localSortOrder, onSort, columns]
  );

  const tableRows = useMemo(
    () =>
      data.map((item, index) => (
        <TableRow
          key={`${String((item as any).id) || index}`}
          item={item}
          columns={columns}
          index={index}
          isEven={index % 2 === 0}
        />
      )),
    [data, columns]
  );

  const paginationInfo = useMemo(
    () => ({
      start: Math.min((currentPage - 1) * 10 + 1, totalItems),
      end: Math.min(currentPage * 10, totalItems),
      total: totalItems,
    }),
    [currentPage, totalItems]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#18D043] animate-ping"></div>
        </div>
        <p className="font-medium text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
          <span className="text-3xl">🔍</span>
        </div>
        <div className="max-w-md text-center">
          <h3 className="mb-3 text-xl font-semibold text-gray-900">
            No se encontró ningún registro
          </h3>
          <p className="mb-2 text-gray-600">
            No hay registros que coincidan con los criterios de búsqueda
            actuales.
          </p>
          <p className="text-sm text-gray-500">
            Intenta ajustar los filtros o términos de búsqueda para obtener
            resultados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tabla con header sticky */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        {/* Scroll horizontal si hace falta */}
        <div className="overflow-x-auto">
          {/* Scroll vertical del body */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: maxBodyHeight,
              ["--header-offset" as any]: `${headerOffset}px`,
            }}
          >
            {/* table-fixed evita desajustes al aparecer el scrollbar vertical */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {columns.map((column) => {
                    const isSorted = localSortBy === (column.key as keyof T);
                    const isAscending = isSorted && localSortOrder === "asc";
                    const isDescending = isSorted && localSortOrder === "desc";

                    return (
                      <th
                        key={String(column.key)}
                        className={[
                          stickyHeader
                            ? "sticky [top:var(--header-offset)] z-10"
                            : "",
                          "bg-gradient-to-r from-gray-50 to-gray-100",
                          "px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider",
                          "border-r border-gray-200 last:border-r-0 shadow-sm",
                          column.width ? String(column.width) : "",
                          column.sortable
                            ? "cursor-pointer hover:bg-gray-200 transition-colors duration-200 group"
                            : "",
                        ].join(" ")}
                        onClick={() =>
                          column.sortable && handleSort(column.key as keyof T)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <span className={isSorted ? "text-[#16a34a]" : ""}>
                            {column.label}
                          </span>
                          {column.sortable && (
                            <div className="flex flex-col">
                              {!isSorted && (
                                <ArrowUpDown
                                  size={12}
                                  className="text-gray-400 transition-colors duration-200 group-hover:text-gray-600"
                                />
                              )}
                              {isAscending && (
                                <ArrowUp
                                  size={12}
                                  className="text-[#16a34a] animate-pulse"
                                />
                              )}
                              {isDescending && (
                                <ArrowDown
                                  size={12}
                                  className="text-[#16a34a] animate-pulse"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {tableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex flex-col items-center justify-between px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-white border border-gray-200 shadow-sm sm:flex-row sm:space-y-0 rounded-xl">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 rounded-lg bg-gray-50">
            <span className="font-medium">
              {paginationInfo.start} - {paginationInfo.end}
            </span>
            <span className="text-gray-500"> de </span>
            <span className="font-medium">{paginationInfo.total}</span>
            <span className="text-gray-500"> registros</span>
          </div>

          {totalPages > 1 && (
            <div className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-500 rounded-lg bg-blue-50">
              Página{" "}
              <span className="font-medium text-blue-600">{currentPage}</span>{" "}
              de <span className="font-medium text-blue-600">{totalPages}</span>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={ChevronLeft}
              className="w-full sm:w-auto border-gray-300 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Button>

            <PaginationButtons
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={ChevronRight}
              iconPosition="right"
              className="w-full sm:w-auto border-gray-300 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="sm:hidden">Siguiente</span>
            </Button>
          </div>
        )}
      </div>

      {/* Info pie */}
      <div className="flex items-center justify-center">
        <div className="flex items-center px-4 py-2 space-x-4 text-xs text-gray-500 rounded-full bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span>Datos actualizados</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span>Mostrando resultados en tiempo real</span>
          </div>
        </div>
      </div>
    </div>
  );
};
