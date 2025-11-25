import { useState, useCallback } from "react";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const rule = schema[name];
      if (!rule) return null;

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return null;
      }

      // String-specific validations
      if (typeof value === "string") {
        // Min length validation
        if (rule.minLength && value.length < rule.minLength) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters`;
        }

        // Max length validation
        if (rule.maxLength && value.length > rule.maxLength) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} must not exceed ${rule.maxLength} characters`;
        }

        // Email validation
        if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`;
        }
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [schema]
  );

  const validate = useCallback(
    (data: Record<string, any>): boolean => {
      const newErrors: ValidationErrors = {};

      Object.keys(schema).forEach((fieldName) => {
        const error = validateField(fieldName, data[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [schema, validateField]
  );

  const validateSingle = useCallback(
    (name: string, value: any): boolean => {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || "",
      }));
      return !error;
    },
    [validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    validateSingle,
    clearErrors,
    clearError,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// Common validation schemas
export const actorValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  bio: {
    maxLength: 1000,
  },
};

export const musicalValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  composer: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  lyricist: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  genre: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  synopsis: {
    maxLength: 2000,
  },
};

export const theaterValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  address: {
    maxLength: 200,
  },
};

export const performanceValidationSchema: ValidationSchema = {
  date: {
    required: true,
    custom: (value) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (date < now) {
        return "Performance date cannot be in the past";
      }
      return null;
    },
  },
  time: {
    required: true,
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  musicalId: {
    required: true,
  },
  theaterId: {
    required: true,
  },
};
