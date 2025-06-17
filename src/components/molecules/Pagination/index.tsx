import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}) => {
  // Se há apenas uma página ou menos, não mostra paginação
  if (totalPages <= 1) return null;

  // Calcula o range de itens sendo exibidos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gera array de páginas para exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para muitas páginas
      if (currentPage <= 4) {
        // Início: 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Final: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
      {/* Informações dos resultados */}
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a{" "}
        <span className="font-medium">{endItem}</span> de{" "}
        <span className="font-medium">{totalItems}</span> resultados
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Botão Anterior */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-10 h-10 text-gray-500"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageClick(pageNumber)}
                disabled={isLoading}
                className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Botão Próximo */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
