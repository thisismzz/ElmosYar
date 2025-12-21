import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.svg";
import './login.css';

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
  username: yup.string().required("نام کاربری یا ایمیل الزامی است"),
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
        <div className="floating-input">
          <input
            type="text"
            placeholder=" "
            {...register("username")}
            className={`form-input ${errors.username ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">نام کاربری یا پست الکترونیک</label>
        </div>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
      </div>

      <div className="form-group">
        <div className="floating-input">
          <input
            type="password"
            placeholder=" "
            {...register("password")}
            className={`form-input ${errors.password ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">رمز عبور</label>
        </div>
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
        className="auth-submit-button"
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
        <div className="floating-input">
          <input
            type="email"
            placeholder=" "
            {...customRegister("email")}
            className={`form-input ${errors.email || apiErrors.email ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">پست الکترونیک</label>
        </div>
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
        {apiErrors.email && !errors.email && (
          <p className="error-message">{apiErrors.email}</p>
        )}
      </div>

      <div className="form-group">
        <div className="floating-input">
          <input
            type="text"
            placeholder=" "
            {...customRegister("username")}
            className={`form-input ${errors.username || apiErrors.username ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">نام کاربری</label>
        </div>
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
        {apiErrors.username && !errors.username && (
          <p className="error-message">{apiErrors.username}</p>
        )}
      </div>

      <div className="form-group">
        <div className="floating-input">
          <input
            type="password"
            placeholder=" "
            {...customRegister("password")}
            className={`form-input ${errors.password ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">رمز عبور</label>
        </div>
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="form-group">
        <div className="floating-input">
          <input
            type="password"
            placeholder=" "
            {...customRegister("repeatPassword")}
            className={`form-input ${errors.repeatPassword ? 'error' : ''}`}
            disabled={isLoading}
          />
          <label className="floating-label">تکرار رمز عبور</label>
        </div>
        {errors.repeatPassword && (
          <p className="error-message">{errors.repeatPassword.message}</p>
        )}
      </div>

      <button 
        type="submit" 
        className="auth-submit-button"
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0); // seconds
  const [isResending, setIsResending] = useState<boolean>(false);
  const [unverifiedAccount, setUnverifiedAccount] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { login, register: authRegister, isLoading, isAuthenticated, resendVerificationEmail } = useAuth();
  const location = useLocation()

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
  
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);
  
  // Show any API error passed via navigation state (e.g., from verify-email redirect)
  useEffect(() => {
    const navError = (location.state as any)?.apiError;
    if (navError) {
      setApiError(navError);
      // clear navigation state so message doesn't persist on back/refresh
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {}
    }
  }, [location]);
  
  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="login-logo-container">
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
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      const resp = error.response?.data;
      const errorMessage = resp?.message || error.message || 'خطا در ورود. لطفاً مجدداً تلاش کنید.';

      // If account not verified, show the unverified UI and extract email if provided (to be changed)
      if (errorMessage.startsWith('Please verify') || resp?.detail === 'Account is not active') {
        // try several places where email might be provided
        const email = resp?.user?.email || resp?.email || resp?.data?.email || null;
        setUnverifiedAccount(true);
        setUnverifiedEmail(email);
        setSignupSuccess(false);
        setApiError(null);
        setCurrentMode('login');
      } else {
        setApiError(errorMessage);
      }
    }
  };
  
  const handleSignUpSubmit = async (data: SignUpFormData) => {
    try {
      setApiError(null);
      setSignUpApiErrors({});
      const { repeatPassword, ...signUpData } = data;
      const response = await authRegister({ password: signUpData.password, email: signUpData.email, username: signUpData.username });
      setSignupSuccess(true);
      setSignupEmail(signUpData.email);
      setResendCooldown(120);
    } 
    catch (error: any) {
      
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
      console.log(fieldErrors)
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
  
  const handleResendEmail = async () => {
    const activeEmail = signupEmail || unverifiedEmail;
    if (!activeEmail || resendCooldown > 0) return;
    try {
      setIsResending(true);
      await resendVerificationEmail(activeEmail);
      // restart cooldown
      setResendCooldown(120);
    } catch (err) {
      // show api error briefly
      const message = (err as any)?.response?.data?.message || 'خطا در ارسال ایمیل. لطفاً مجدداً تلاش کنید.';
      setApiError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleReturnToLogin = () => {
    setSignupSuccess(false);
    setSignupEmail(null);
    setSignUpApiErrors({});
    setApiError(null);
    setCurrentMode('login');
  };

  const handleTabChange = (mode: FormMode) => {
    setCurrentMode(mode);
    setApiError(null);
    setSignUpApiErrors({});
    setSignupSuccess(false);
    setSignupEmail(null);
    setUnverifiedAccount(false);
    setUnverifiedEmail(null);
    setResendCooldown(0);
    setIsResending(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Reusable verification panel for signup-success and unverified-account flows
  const VerificationPanel: React.FC<{
    message: string;
    email: string | null;
    onResend: () => void;
    onReturn: () => void;
    isResending: boolean;
    resendCooldown: number;
  }> = ({ message, email, onResend, onReturn, isResending, resendCooldown }) => {
    return (
      <div className="signup-success">
        <p className="success-message">{message}</p>
        {email && (
          <p className="success-sub">
            ایمیل ارسال شده به: <strong>{email}</strong>
            <button
              className="resend-inline"
              onClick={onResend}
              disabled={resendCooldown > 0 || isResending}
              aria-label="resend verification email"
            >
              {isResending ? 'در حال ارسال...' : (resendCooldown > 0 ? `ارسال مجدد (${formatTime(resendCooldown)})` : 'ارسال مجدد')}
            </button>
          </p>
        )}
        <div className="signup-actions">
          <button className="auth-submit-button" onClick={onReturn}>بازگشت به صفحه ورود</button>
        </div>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-logo-container">
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

        {currentMode === "login" && !unverifiedAccount && (
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
        )}

        {currentMode === "login" && unverifiedAccount && (
          <VerificationPanel
            message={'حساب کاربری شما هنوز فعال نشده است. لطفاً ایمیل خود را برای فعال‌سازی بررسی کنید.'}
            email={unverifiedEmail}
            onResend={handleResendEmail}
            onReturn={() => { setUnverifiedAccount(false); setUnverifiedEmail(null); }}
            isResending={isResending}
            resendCooldown={resendCooldown}
          />
        )}
        {currentMode === "signup" && !signupSuccess && (
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            isLoading={isLoading}
            apiErrors={signUpApiErrors}
            clearApiError={clearSignUpApiError}
          />
        )}

        {currentMode === "signup" && signupSuccess && (
          <VerificationPanel
            message={'ثبت‌نام با موفقیت انجام شد. لطفاً ایمیل خود را برای فعال‌سازی حساب بررسی کنید.'}
            email={signupEmail}
            onResend={handleResendEmail}
            onReturn={handleReturnToLogin}
            isResending={isResending}
            resendCooldown={resendCooldown}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;