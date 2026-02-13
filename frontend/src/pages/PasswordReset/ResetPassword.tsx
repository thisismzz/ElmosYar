import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import Logo from '../../components/LogoComponent';
import '../Login/login.css';

interface ResetPasswordFormData {
  password: string;
  passwordConfirm: string;
}

// Validation Schema
const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(8, "رمز عبور باید حداقل 8 کاراکتر باشد"),
  passwordConfirm: yup
    .string()
    .required("تکرار رمز عبور الزامی است")
    .oneOf([yup.ref('password')], "رمز عبور و تکرار آن باید یکسان باشند"),
});

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError("توکن بازیابی رمز عبور نامعتبر است.");
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      setSuccessMessage(null);
      
      await resetPassword(token, data.password, data.passwordConfirm);
      
      setSuccessMessage("رمز عبور شما با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.detail ||
        'خطا در تغییر رمز عبور. لطفاً مجدداً تلاش کنید.';
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
        <h1 className="welcome-title">تنظیم رمز عبور جدید</h1>
        
        {!successMessage ? (
          <>
            <p className="auth-description">
              لطفاً رمز عبور جدید خود را وارد کنید.
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
                    type="password"
                    placeholder=" "
                    {...register("password")}
                    className={`auth-form-input ${errors.password ? 'error' : ''}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <label className="floating-label">رمز عبور جدید</label>
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
                    {...register("passwordConfirm")}
                    className={`auth-form-input ${errors.passwordConfirm ? 'error' : ''}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <label className="floating-label">تکرار رمز عبور جدید</label>
                </div>
                {errors.passwordConfirm && (
                  <p className="error-message">{errors.passwordConfirm.message}</p>
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
                {isLoading ? 'در حال تغییر رمز عبور...' : 'تغییر رمز عبور'}
              </button>
            </form>
          </>
        ) : (
          <div className="signup-success">
            <p className="success-message">{successMessage}</p>
            <p className="success-sub">
              در حال انتقال به صفحه ورود...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
