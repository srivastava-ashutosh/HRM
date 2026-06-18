import React from 'react';

const FormField = ({ label, name, error, touched, children, required }) => {
  return (
    <div className={`form-group ${error && touched ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {error && touched && <span className="field-error">{error}</span>}
    </div>
  );
};

export const useFormField = (value, validators = []) => {
  const [touched, setTouched] = React.useState(false);
  const error = React.useMemo(() => {
    if (!touched) return null;
    for (const validator of validators) {
      const result = validator(value);
      if (result) return result;
    }
    return null;
  }, [value, touched, validators]);

  return { error, touched, setTouched, valid: !error };
};

export default FormField;
