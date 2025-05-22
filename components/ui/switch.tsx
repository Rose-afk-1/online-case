import React, { useState } from 'react';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  id,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  
  const handleChange = () => {
    if (disabled) return;
    
    const newValue = onCheckedChange !== undefined ? !checked : !isChecked;
    
    if (onCheckedChange) {
      onCheckedChange(newValue);
    } else {
      setIsChecked(newValue);
    }
  };
  
  const switchChecked = onCheckedChange !== undefined ? checked : isChecked;
  
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={switchChecked}
      disabled={disabled}
      onClick={handleChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        switchChecked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          switchChecked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
} 