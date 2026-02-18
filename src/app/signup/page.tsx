'use client';

import { useState, FormEvent, ChangeEvent, JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

interface ApiError {
  message: string;
}

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }

    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters long');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your password');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Redirect to dashboard or verification page
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.heading}>Create Account</h1>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Full Name<span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email<span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password<span style={styles.required}>*</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePasswordBtn}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p style={styles.passwordHint}>
              Must contain 8+ characters, uppercase, lowercase, number, and special character
            </p>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password<span style={styles.required}>*</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.togglePasswordBtn}
                disabled={loading}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/login" style={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  formWrapper: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#333333',
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fcc',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
  },
  required: {
    color: '#e74c3c',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cccccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  togglePasswordBtn: {
    position: 'absolute',
    right: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666666',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    padding: '0',
  },
  passwordHint: {
    fontSize: '12px',
    color: '#999999',
    marginTop: '6px',
    marginBottom: '0',
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666666',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
