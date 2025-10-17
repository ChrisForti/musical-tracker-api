import React, { useState } from 'react';
import { useToast } from '~/components/common/ToastProvider';

interface FormWrapperProps {
  title: string;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  isLoading = false,
  children,
  className = ''
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting || isLoading) return;

    try {
      setSubmitting(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      
      await onSubmit(data);
      addToast({ type: 'success', title: 'Success', message: 'Form submitted successfully!' });
    } catch (error) {
      console.error('Form submission error:', error);
      addToast({ 
        type: 'error', 
        title: 'Error', 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || isLoading;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {children}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isDisabled}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {(submitting || isLoading) && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};