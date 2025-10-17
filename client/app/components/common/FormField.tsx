import React from 'react';

import { RichTextEditor } from './RichTextEditor';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'time' | 'richtext';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string } }) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLDivElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  maxLength,
  className = ''
}) => {
  const baseClasses = `
    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim();

  const renderInput = () => {
    switch (type) {
      case 'richtext':
        return (
          <RichTextEditor
            label={label}
            name={name}
            value={value}
            onChange={onChange as (e: { target: { name: string; value: string } }) => void}
            onBlur={onBlur as (e: React.FocusEvent<HTMLDivElement>) => void}
            error={error}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            className=""
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={`${baseClasses} resize-vertical`}
          />
        );
      
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
            onBlur={onBlur as React.FocusEventHandler<HTMLSelectElement>}
            disabled={disabled}
            className={baseClasses}
          >
            <option value="">Select {label.toLowerCase()}...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={baseClasses}
          />
        );
    }
  };

  // For rich text editor, we don't wrap it since it handles its own layout
  if (type === 'richtext') {
    return renderInput();
  }

  return (
    <div className={className}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};