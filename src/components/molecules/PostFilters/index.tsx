import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Calendar,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "../../../hooks/toast";

interface PostFiltersProps {
  onSearch: (search: string) => void;
  onDateFilter: (startDate: string, endDate: string) => void;
  onClearFilters: () => void;
  searchValue: string;
  startDate: string;
  endDate: string;
}

const PostFilters: React.FC<PostFiltersProps> = ({
  onSearch,
  onDateFilter,
  onClearFilters,
  searchValue,
  startDate,
  endDate,
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [isExpanded, setIsExpanded] = useState(true); // Inicia aberto
  const { addToast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);

    // Limpa o timeout anterior se existir
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Define um novo timeout para busca com debounce
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300); // 300ms de debounce
  };

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Função para validar datas
  const validateDates = (startDateValue: string, endDateValue: string) => {
    if (startDateValue && endDateValue) {
      const startDateObj = new Date(startDateValue);
      const endDateObj = new Date(endDateValue);

      if (endDateObj < startDateObj) {
        addToast({
          title: "Data inválida",
          description:
            "A data final deve ser maior que a data inicial para filtrar.",
          type: "error",
          duration: 4000,
        });
        return false;
      }
    }
    return true;
  };

  const handleStartDateChange = (value: string) => {
    setLocalStartDate(value);

    // Valida as datas antes de aplicar o filtro
    if (validateDates(value, localEndDate)) {
      onDateFilter(value, localEndDate);
    } else {
      // Se inválido, limpa os filtros de data
      onDateFilter("", "");
    }
  };

  const handleEndDateChange = (value: string) => {
    setLocalEndDate(value);

    // Valida as datas antes de aplicar o filtro
    if (validateDates(localStartDate, value)) {
      onDateFilter(localStartDate, value);
    } else {
      // Se inválido, limpa os filtros de data
      onDateFilter("", "");
    }
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalStartDate("");
    setLocalEndDate("");
    onClearFilters();
  };

  const hasActiveFilters = searchValue || startDate || endDate;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Header do Filtro - Sempre Visível */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {[searchValue, startDate, endDate].filter(Boolean).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Limpar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Conteúdo Colapsável */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Campo de Busca */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pesquisar por título ou conteúdo..."
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </form>

            {/* Filtros de Data */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Data inicial"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Data final"
                />
              </div>
            </div>
          </div>

          {/* Indicadores de Filtros Ativos */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchValue && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  &quot;{searchValue}&quot;
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  De:{" "}
                  {new Date(startDate + "T12:00:00").toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  Até:{" "}
                  {new Date(endDate + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostFilters;
