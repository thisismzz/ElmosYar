import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.svg";
import './login.css';

// Interfaces
interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  isLoading: boolean;
  apiErrors: { [key: string]: string };
  clearApiError: (fieldName: string) => void;
}

// Validation Schemas
const loginSchema = yup.object({
  username: yup.string().required("نام کاربری الزامی است"),
  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
  rememberMe: yup.boolean().required()
});

const signupSchema = yup.object({
  email: yup
    .string()
    .required("ایمیل الزامی است")
    .email("فرمت ایمیل نامعتبر است")
    .matches(/iust\.ac\.ir$/, 'ایمیل باید با iust.ac.ir پایان یابد'),
  username: yup
    .string()
    .required("نام کاربری الزامی است")
    .min(3, "نام کاربری باید حداقل 3 کاراکتر باشد"),
  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
  repeatPassword: yup
    .string()
    .required("تکرار رمز عبور الزامی است")
    .oneOf([yup.ref('password')], "رمز عبور و تکرار آن باید یکسان باشند"),
});

// Form Components
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      rememberMe: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <input
          type="text"
          placeholder="نام کاربری"
          {...register("username")}
          className={`form-input ${errors.username ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="رمز عبور"
          {...register("password")}
          className={`form-input ${errors.password ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="remember-forgot">
        <label className="remember-me">
          <input
            type="checkbox"
            {...register("rememberMe")}
            disabled={isLoading}
          />
          مرا به خاطر بسپار
        </label>
        <a href="#" className="forgot-password">فراموشی رمز عبور؟</a>
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'در حال ورود...' : 'ورود'}
      </button>
    </form>
  );
};

const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onSubmit, 
  isLoading, 
  apiErrors, 
  clearApiError 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onSubmit",
  });

  // Create a custom register function that clears API errors on change
  const customRegister = (fieldName: keyof SignUpFormData) => {
    const { onChange, ...rest } = register(fieldName);
    return {
      ...rest,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clear API error for this field when user starts typing
        if (apiErrors[fieldName]) {
          clearApiError(fieldName);
        }
        if (onChange) {
          onChange(e);
        }
      },
    };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <input
          type="email"
          placeholder="ایمیل"
          {...customRegister("email")}
          className={`form-input ${errors.email || apiErrors.email ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
        {apiErrors.email && !errors.email && (
          <p className="error-message">{apiErrors.email}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="نام کاربری"
          {...customRegister("username")}
          className={`form-input ${errors.username || apiErrors.username ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
        {apiErrors.username && !errors.username && (
          <p className="error-message">{apiErrors.username}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="رمز عبور"
          {...customRegister("password")}
          className={`form-input ${errors.password ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="تکرار رمز عبور"
          {...customRegister("repeatPassword")}
          className={`form-input ${errors.repeatPassword ? 'error' : ''}`}
          disabled={isLoading}
        />
        {errors.repeatPassword && (
          <p className="error-message">{errors.repeatPassword.message}</p>
        )}
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>
    </form>
  );
};

// Main Component
type FormMode = "login" | "signup";

const RegisterPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<FormMode>("login");
  const [apiError, setApiError] = useState<string | null>(null);
  const [signUpApiErrors, setSignUpApiErrors] = useState<{ [key: string]: string }>({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { login, register: authRegister, isLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // If user is authenticated, redirect to home
        if (isAuthenticated) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="login-card">
          <div className="loading-container">
            <p>در حال بررسی وضعیت ورود...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      await login({
        username_or_email: data.username,
        password: data.password,
        rememberMe: data.rememberMe
      });
    } catch (error: any) {
      console.log("Login error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'خطا در ورود. لطفاً مجدداً تلاش کنید.';
      
      setApiError(errorMessage);
    }
  };

  const handleSignUpSubmit = async (data: SignUpFormData) => {
    try {
      setApiError(null);
      setSignUpApiErrors({});
      const { repeatPassword, ...signUpData } = data;
      await authRegister({"password":signUpData.password, "email": signUpData.email, "username": signUpData.username});
      navigate("/"); // to be changed to Edit profile page
    } catch (error: any) {
      console.log("Signup error:", error);
      
      const fieldErrors: { [key: string]: string } = {};
      
      if (error.response?.data?.errors) {
        const details = error.response.data.errors;
        if (Array.isArray(details)) {
          details.forEach((detail: any) => {
            if (detail.field) {
              fieldErrors[detail.field] = detail.message;
            }
          });
        } else if (typeof details === 'object') {
          // If details is an object with field names as keys
          Object.keys(details).forEach(field => {
            if (Array.isArray(details[field])) {
              fieldErrors[field] = details[field].join(', ');
            } else {
              fieldErrors[field] = details[field];
            }
          });
        }
      }

      // If we have field-specific errors, set them
      if (Object.keys(fieldErrors).length > 0) {
        setSignUpApiErrors(fieldErrors);
      } else {
        // Fallback to general error from API message
        const errorMessage = error.response?.data?.message || 
                            'خطا در ثبت‌نام. لطفاً مجدداً تلاش کنید.';
        setApiError(errorMessage);
      }
    }
  };

  const clearSignUpApiError = (fieldName: string) => {
    setSignUpApiErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleTabChange = (mode: FormMode) => {
    setCurrentMode(mode);
    setApiError(null);
    setSignUpApiErrors({});
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="login-card">
        <h1 className="welcome-title">به علموص‌یار خوش آمدید!</h1>
        <div className="tabs-container">
          <button
            onClick={() => handleTabChange("signup")}
            className={`tab-button ${currentMode === "signup" ? "active" : ""}`}
            disabled={isLoading}
          >
            ثبت‌نام
          </button>
          <button
            onClick={() => handleTabChange("login")}
            className={`tab-button ${currentMode === "login" ? "active" : ""}`}
            disabled={isLoading}
          >
            ورود
          </button>
        </div>

        {apiError && (
          <div className="api-error-message">
            {apiError}
          </div>
        )}

        {currentMode === "login" && (
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
        )}
        {currentMode === "signup" && (
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            isLoading={isLoading}
            apiErrors={signUpApiErrors}
            clearApiError={clearSignUpApiError}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;