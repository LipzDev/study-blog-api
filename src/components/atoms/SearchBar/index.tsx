/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Search } from "lucide-react";

export type SearchBar = {
  isFocused?: boolean;
  onChange?: (e: any) => void;
  value?: string;
};

const SearchBar = ({ onChange, value }: SearchBar) => {
  const [focus, setFocus] = useState(false);

  return (
    <div
      className={`relative flex items-center border-2 rounded-lg transition-colors ${
        focus || (value !== "" && value !== undefined)
          ? "border-blue-500 bg-white"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          focus || (value !== "" && value !== undefined)
            ? "text-xs text-blue-500 -top-2 bg-white px-1"
            : "text-gray-500 top-1/2 transform -translate-y-1/2"
        }`}
      >
        Pesquisar
      </label>
      <input
        type="text"
        className="w-full px-3 py-2 bg-transparent border-none outline-none text-gray-800 pt-4"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={onChange}
        value={value}
      />
      <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
