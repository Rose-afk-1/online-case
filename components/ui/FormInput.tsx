import React from 'react';

interface FormInputProps {
  label: string;
  id?: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  type,
  value,
  onChange,
  required = false,
  placeholder,
  options,
  rows = 3,
  min,
  max,
  step,
  disabled = false
}) => {
  const inputId = id || `form-input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const inputClasses = "mt-1.5 block w-full p-2.5 border-2 border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium";
  
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={inputClasses}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          className={inputClasses}
          value={value as string}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {!required && <option value="" className="text-gray-500">Select an option</option>}
          {options?.map(option => (
            <option key={option.value} value={option.value} className="text-black">
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          className={inputClasses}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default FormInput; 