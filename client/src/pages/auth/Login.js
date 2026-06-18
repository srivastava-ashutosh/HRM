import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormField from '../../components/common/FormField';
import validation from '../../utils/validation';
import { FiLock, FiUser, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

const loginRules = (values) => ({
  username: validation.required('Username is required'),
  password: validation.compose(
    validation.required('Password is required'),
    validation.minLength(4, 'Password must be at least 4 characters')
  ),
});

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [cardLoaded, setCardLoaded] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  useEffect(() => { setCardLoaded(true); usernameRef.current?.focus(); }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const rules = loginRules(next);
      const { errors: fieldErrors } = validation.validate(next, rules);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const rules = loginRules(form);
    const { errors: fieldErrors } = validation.validate(form, rules);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const fillCredentials = (username, password) => {
    setForm({ username, password });
    setTouched({ username: true, password: true });
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const allTouched = { username: true, password: true };
    setTouched(allTouched);
    const rules = loginRules(form);
    const { valid, errors: validationErrors } = validation.validate(form, rules);
    setErrors(validationErrors);
    if (!valid) { setShakeKey((k) => k + 1); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      if (remember) {
        localStorage.setItem('rememberedUser', form.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      navigate('/');
    } catch (err) {
      setServerError(err.normalizedMessage || err.response?.data?.message || 'Login failed');
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
      <div className={`login-card ${cardLoaded ? 'card-visible' : ''}`}>
        <div className="login-logo">
          <div className="login-icon-wrapper">
            <FiLogIn size={28} />
          </div>
          <h2>IndiaNIC HRM</h2>
          <p>Human Resource Management</p>
        </div>

        <form onSubmit={handleSubmit} key={shakeKey} className={serverError ? 'shake' : ''}>
          {serverError && <div className="error-msg fade-in"><span>⚠</span> {serverError}</div>}

          <FormField label="Username" name="username" error={errors.username} touched={touched.username} required>
            <div className="input-wrapper">
              <FiUser className="input-icon" size={16} />
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange('username')}
                onBlur={handleBlur('username')}
                placeholder="Enter your username"
              />
            </div>
          </FormField>

          <FormField label="Password" name="password" error={errors.password} touched={touched.password} required>
            <div className="input-wrapper">
              <FiLock className="input-icon" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                placeholder="Enter your password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)} tabIndex={-1}>
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </FormField>

          <div className="login-options">
            <label className="checkbox-label">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
          </div>

          <button className="btn btn-primary btn-block login-btn" disabled={loading} type="submit">
            {loading ? (
              <span className="btn-loading-content">
                <span className="spinner-sm" />
                Signing in...
              </span>
            ) : (
              <span className="btn-content">
                <FiLogIn size={16} />
                Login
              </span>
            )}
          </button>
        </form>

        <div className="login-credentials fade-in-delayed">
          <strong>Demo Credentials</strong>
          <div className="credential-buttons">
            <button type="button" className="cred-btn" onClick={() => fillCredentials('admin', 'admin123')}>
              <span className="cred-role">Admin</span>
              <span className="cred-detail">admin / admin123</span>
            </button>
            <button type="button" className="cred-btn" onClick={() => fillCredentials('john', 'john123')}>
              <span className="cred-role">ESS User</span>
              <span className="cred-detail">john / john123</span>
            </button>
          </div>
        </div>

        <div className="login-footer">
          &copy; 2026 IndiaNIC HRM. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
