import { useState, useEffect, useCallback, useRef } from 'react';

export interface DraftOptions {
  key: string;
  autosaveInterval?: number; // in milliseconds
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
}

export const useDraft = <T extends Record<string, any>>(
  initialData: T,
  options: DraftOptions
) => {
  const [data, setData] = useState<T>(initialData);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { key, autosaveInterval = 3000, onSave, onLoad } = options;

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftKey = `draft_${key}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          setData(parsedDraft.data);
          setLastSaved(new Date(parsedDraft.timestamp));
          setIsDraftSaved(true);
          onLoad?.(parsedDraft.data);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };

    loadDraft();
  }, [key, onLoad]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      const draftKey = `draft_${key}`;
      const draftData = {
        data,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setLastSaved(new Date());
      setIsDraftSaved(true);
      onSave?.(data);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [key, data, onSave]);

  // Auto-save when data changes
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only auto-save if there's meaningful data (not just initial empty state)
    const hasData = Object.values(data).some(value => 
      value !== '' && value !== null && value !== undefined && value !== false
    );

    if (hasData) {
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, autosaveInterval);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, autosaveInterval, saveDraft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      const draftKey = `draft_${key}`;
      localStorage.removeItem(draftKey);
      setIsDraftSaved(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [key]);

  // Update data
  const updateData = useCallback((newData: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' ? newData(prev) : { ...prev, ...newData };
      setIsDraftSaved(false);
      return updated;
    });
  }, []);

  // Force save draft
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  return {
    data,
    updateData,
    isDraftSaved,
    lastSaved,
    saveDraft: forceSave,
    clearDraft,
    hasDraft: lastSaved !== null
  };
};