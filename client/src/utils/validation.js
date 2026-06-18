const validation = {
  required: (msg = 'This field is required') => (value) => {
    if (value === undefined || value === null) return msg;
    if (typeof value === 'string' && !value.trim()) return msg;
    if (typeof value === 'number' && isNaN(value)) return msg;
    return null;
  },

  email: (msg = 'Invalid email address') => (value) => {
    if (!value) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg;
  },

  minLength: (min, msg) => (value) => {
    if (!value) return null;
    return (value.length || 0) >= min ? null : (msg || `Minimum ${min} characters required`);
  },

  maxLength: (max, msg) => (value) => {
    if (!value) return null;
    return (value.length || 0) <= max ? null : (msg || `Maximum ${max} characters allowed`);
  },

  min: (min, msg) => (value) => {
    if (value === undefined || value === null) return null;
    return Number(value) >= min ? null : (msg || `Minimum value is ${min}`);
  },

  max: (max, msg) => (value) => {
    if (value === undefined || value === null) return null;
    return Number(value) <= max ? null : (msg || `Maximum value is ${max}`);
  },

  pattern: (regex, msg) => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : (msg || 'Invalid format');
  },

  compose: (...validators) => (value) => {
    for (const validator of validators) {
      const result = validator(value);
      if (result) return result;
    }
    return null;
  },

  validate: (values, rules) => {
    const errors = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
      const error = fieldRules(values[field], values);
      if (error) errors[field] = error;
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default validation;
