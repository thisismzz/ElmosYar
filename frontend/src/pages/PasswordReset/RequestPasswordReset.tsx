import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";
import Logo from '../../components/LogoComponent';
import '../Login/login.css';

interface RequestPasswordResetFormData {
  email: string;
}

// Validation Schema
const requestPasswordResetSchema = yup.object({
  email: yup
    .string()
    .required("ایمیل الزامی است")
    .email("فرمت ایمیل نامعتبر است")
    .matches(/iust\.ac\.ir$/, 'ایمیل باید با iust.ac.ir پایان یابد')
});

const RequestPasswordResetPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetFormData>({
    resolver: yupResolver(requestPasswordResetSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);
      setSuccessMessage(null);
      
      await requestPasswordReset(data.email);
      
      setSuccessMessage("اگر این ایمیل در سیستم ما وجود داشته باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        'خطا در ارسال درخواست. لطفاً مجدداً تلاش کنید.';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-logo-container">
        <Logo></Logo>
      </div>
      <div className="login-card">
        <h1 className="welcome-title">بازیابی رمز عبور</h1>
        
        {!successMessage ? (
          <>
            <p className="auth-description">
              لطفاً ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
            </p>

            {apiError && (
              <div className="api-error-message">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <div className="floating-input">
                  <input
                    type="email"
                    placeholder=" "
                    {...register("email")}
                    className={`auth-form-input ${errors.email ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  <label className="floating-label">پست الکترونیک</label>
                </div>
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div className="auth-footer">
                <a 
                  href="/login"
                  className="link-button"
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                    }
                  }}
                >
                  بازگشت به صفحه ورود
                </a>
              </div>

              <button 
                type="submit" 
                className="auth-submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </button>
            </form>
          </>
        ) : (
          <div className="signup-success">
            <p className="success-message">{successMessage}</p>
            <p className="success-sub">
              لطفاً ایمیل خود را بررسی کنید و روی لینک ارسال شده کلیک کنید.
            </p>
            <div className="signup-actions">
              <button 
                className="auth-submit-button" 
                onClick={handleBackToLogin}
              >
                بازگشت به صفحه ورود
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordResetPage;
