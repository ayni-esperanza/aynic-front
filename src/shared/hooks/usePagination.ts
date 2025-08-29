import { useState, useMemo } from 'react';
import type { PaginationState } from '../types';

interface UsePaginationProps {
  data: any[];
  itemsPerPage?: number;
}

export const usePagination = ({ data, itemsPerPage = 10 }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationState: PaginationState = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    };
  }, [data, itemsPerPage, currentPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationState.totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    paginatedData,
    paginationState,
    goToPage,
    nextPage,
    prevPage,
  };
};