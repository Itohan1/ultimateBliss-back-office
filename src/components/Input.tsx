// components/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ label, helper, error, ...props }) => {
  return (
    <div className="mb-3 flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className={`border rounded-lg p-2 outline-none focus:outline-none transition
          ${
            error ? "border-red-500" : "border-gray-300 focus:border-[#FE408E]"
          }`}
      />
      {helper && <span className="text-xs text-red-500">{helper}</span>}
    </div>
  );
};

export default Input;
