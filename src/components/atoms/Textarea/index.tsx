/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

export type TextareaProps = {
  isFocused?: boolean;
  required?: boolean;
  placeholder?: string;
  setValueToForm?: any;
  initialValue?: any;
  className?: string;
  rows?: number;
};

const Textarea = ({
  placeholder,
  initialValue,
  required,
  setValueToForm,
  className,
  rows = 4,
}: TextareaProps) => {
  const [focus, setFocus] = useState(false);
  const [valueState, setValueState] = useState(initialValue || "");

  // Atualiza o valor quando initialValue muda
  useEffect(() => {
    setValueState(initialValue || "");
  }, [initialValue]);

  // Chama setValueToForm quando o valor muda
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          isFocused
            ? "text-xs text-blue-500 -top-2 bg-white px-1"
            : "text-gray-500 top-3"
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
      <textarea
        value={valueState}
        rows={rows}
        className={`w-full px-3 py-2 border-2 rounded-lg transition-colors outline-none resize-vertical ${
          isFocused ? "border-blue-500" : "border-gray-200"
        } ${isFocused ? "pt-6" : "pt-8"}`}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={handleChange}
      />
    </div>
  );
};

export default Textarea;
