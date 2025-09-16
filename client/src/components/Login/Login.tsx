import React, { useState, useEffect } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import useSchoolStore from '../../store/Schooldata';
import useAuthStore from '../../store/Loginsstore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { getSchoolUsername } = useSchoolStore();
  const { username: storedUsername, password: storedPassword, setCredentials, clearCredentials } = useAuthStore();

  const schoolUsername = getSchoolUsername();
  
  const [credentials, setCredentialsState] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Auto-fill credentials from auth store if available
  useEffect(() => {
    if (storedUsername && storedPassword) {
      setCredentialsState({
        username: storedUsername,
        password: storedPassword
      });
    } else if (schoolUsername) {
      // Fallback: generate username from school store if no stored credentials
      const sampleUsername = `admin@${schoolUsername}admin`;
      setCredentialsState(prev => ({
        ...prev,
        username: sampleUsername
      }));
    }
  }, [storedUsername, storedPassword, schoolUsername]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (loginData: { username: string; password: string }) => {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Login failed');
      return result;
    },
    onSuccess: (data) => {
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Store credentials in zustand for future auto-login
      setCredentials(credentials.username, credentials.password);

      toast.success('Login successful!');

      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/agent/cockpit/');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    }
  });

  const { mutate: login, isPending: isLoading } = loginMutation;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentialsState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearCredentials = () => {
    clearCredentials();
    setCredentialsState({
      username: schoolUsername ? `admin@${schoolUsername}admin` : '',
      password: ''
    });
    toast.info('Saved credentials cleared');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials);
  };

  return (
    <div className="loginAttractiveContainer">
      <Toaster position='top-center' richColors />
      <div className="loginAttractiveBackground">
        <div className="loginAttractiveShape loginAttractiveShapeOne"></div>
        <div className="loginAttractiveShape loginAttractiveShapeTwo"></div>
        <div className="loginAttractiveShape loginAttractiveShapeThree"></div>
      </div>
      
      <div className="loginAttractiveCard">
        <div className="loginAttractiveHeader">
          <h1 className="loginAttractiveTitle">Welcome Back</h1>
          <p className="loginAttractiveSubtitle">Sign in to your account</p>
        </div>

        <form className="loginAttractiveForm" onSubmit={handleSubmit}>
          <div className="loginAttractiveInputGroup">
            <label htmlFor="loginAttractiveUsername" className="loginAttractiveInputLabel">
              Username
            </label>
            <div className="loginAttractiveInputContainer">
              <i className="loginAttractiveInputIcon fas fa-user"></i>
              <input
                type="text"
                id="loginAttractiveUsername"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="loginAttractiveInputField"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            {storedUsername && (
              <div className="loginAttractiveHelpText">
                <i className="fas fa-info-circle"></i> Using saved username
              </div>
            )}
            {!storedUsername && schoolUsername && (
              <div className="loginAttractiveHelpText">
                <i className="fas fa-info-circle"></i> Suggested username based on your school
              </div>
            )}
          </div>

          <div className="loginAttractiveInputGroup">
            <label htmlFor="loginAttractivePassword" className="loginAttractiveInputLabel">
              Password
            </label>
            <div className="loginAttractiveInputContainer">
              <i className="loginAttractiveInputIcon fas fa-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="loginAttractivePassword"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="loginAttractiveInputField"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="loginAttractivePasswordToggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {storedPassword && (
              <div className="loginAttractiveHelpText">
                <i className="fas fa-info-circle"></i> Using saved password
              </div>
            )}
          </div>

          <div className="loginAttractiveOptionsRow">
            <label className="loginAttractiveRememberMe">
              <input 
                type="checkbox" 
                checked={!!storedUsername} 
                readOnly 
                disabled={isLoading} 
              />
              <span className="loginAttractiveCheckmark"></span>
              Remember me
            </label>
            {storedUsername && (
              <button
                type="button"
                className="loginAttractiveClearCredentials"
                onClick={handleClearCredentials}
                disabled={isLoading}
              >
                Clear saved credentials
              </button>
            )}
            {!storedUsername && (
              <a href="#" className="loginAttractiveForgotLink">Forgot password?</a>
            )}
          </div>

          <button 
            type="submit" 
            className={`loginAttractiveSubmitButton ${isLoading ? 'loginAttractiveButtonLoading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="loginAttractiveSpinner fas fa-spinner"></i>
                Signing In...
              </>
            ) : (
              storedUsername ? 'Sign In Automatically' : 'Sign In'
            )}
          </button>

          <div className="loginAttractiveSignupPrompt">
            Don't have an account?{' '}
            <a onClick={() => navigate('/create/account')} className="loginAttractiveSignupLink">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;