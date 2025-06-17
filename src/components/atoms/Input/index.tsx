/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

export type InputProps = {
  isFocused?: boolean;
  placeholder?: string;
  setValueToForm?: any;
  initialValue?: any;
  required?: boolean;
  type?: string;
  className?: string;
};

const Input = ({
  placeholder,
  initialValue,
  setValueToForm,
  required,
  type = "text",
  className,
}: InputProps) => {
  const [focus, setFocus] = useState(false);
  const [valueState, setValueState] = useState(initialValue || "");

  // Atualiza o valor quando initialValue muda
  useEffect(() => {
    setValueState(initialValue || "");
  }, [initialValue]);

  // Chama setValueToForm quando o valor muda
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValueState(newValue);
    if (setValueToForm) {
      setValueToForm(newValue);
    }
  };

  const isFocused =
    focus || (valueState !== "" && valueState !== undefined) || valueState;

  return (
    <div className={`relative ${className || ""}`}>
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
          isFocused
            ? "text-xs text-blue-600 -top-2 bg-white px-2 rounded"
            : "text-gray-500 top-1/2 transform -translate-y-1/2"
        }`}
      >
        {required ? (
          <>
            {placeholder} <span className="text-red-500">*</span>
          </>
        ) : (
          placeholder
        )}
      </label>
      <input
        value={valueState}
        type={type}
        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none focus:ring-4 focus:ring-blue-200 hover:border-gray-300 ${
          isFocused ? "border-blue-500" : "border-gray-200"
        } ${isFocused ? "pt-4" : ""}`}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={handleChange}
      />
    </div>
  );
};

export default Input;
