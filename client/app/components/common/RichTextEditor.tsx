import React, { useState, useRef, useCallback } from 'react';

interface RichTextEditorProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onChange({
      target: {
        name,
        value: content
      }
    });
  }, [name, onChange]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    if (disabled) return;
    
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      // Trigger onChange after command execution
      const content = editorRef.current.innerHTML;
      onChange({
        target: {
          name,
          value: content
        }
      });
    }
  };

  const formatButtons = [
    { command: 'bold', icon: 'B', title: 'Bold' },
    { command: 'italic', icon: 'I', title: 'Italic' },
    { command: 'underline', icon: 'U', title: 'Underline' },
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' }
  ];

  const baseClasses = `
    min-h-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
  `.trim();

  const currentLength = editorRef.current?.textContent?.length || 0;

  return (
    <div className={`rich-text-editor ${className}`}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-800">
        {formatButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => executeCommand(button.command)}
            disabled={disabled}
            className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={button.title}
          >
            {button.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: value }}
        className={`${baseClasses} border-t-0 rounded-t-none`}
        style={{ 
          minHeight: '120px',
          outline: 'none'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Character count and error */}
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
        
        {maxLength && (
          <div className={`text-xs ${currentLength > maxLength ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {currentLength}/{maxLength}
          </div>
        )}
      </div>

      <style>{`
        .rich-text-editor [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        .rich-text-editor [contenteditable="true"]:focus:empty:before {
          content: "";
        }
      `}</style>
    </div>
  );
};