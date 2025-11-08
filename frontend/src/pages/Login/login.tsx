import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import './login.css';

// Interfaces
interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

interface SignUpFormData {
  email: string;
  username: string;
  password: string;
}

interface OptionalFormData {
  firstName?: string;
  lastName?: string;
  studentNo?: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  defaultValues?: SignUpFormData;
}

interface OptionalSignUpFormProps {
  onSubmit: (data: OptionalFormData) => void;
  onBack: () => void;
}

// Validation Schemas
const loginSchema = yup.object({
  usernameOrEmail: yup
    .string()
    .required("ایمیل یا نام کاربری الزامی است"),
  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

const signupSchema = yup.object({
  email: yup
    .string()
    .required("ایمیل الزامی است")
    .email("فرمت ایمیل نامعتبر است"),
  username: yup
    .string()
    .required("نام کاربری الزامی است")
    .min(3, "نام کاربری باید حداقل 3 کاراکتر باشد"),
  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

const optionalSchema = yup.object({
  firstName: yup.string().optional().default(undefined),
  lastName: yup.string().optional().default(undefined),
  studentNo: yup
    .string()
    .optional()
    .default(undefined)
    .test('studentNo', 'شماره دانشجویی باید 9 رقم باشد', (value) => {
      return !value || value.length === 0 || value.length === 9;
    }),
});

// Form Components
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
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
        <label className="form-label">ایمیل یا نام کاربری</label>
        <input
          type="text"
          placeholder="ایمیل یا نام کاربری خود را وارد کنید"
          {...register("usernameOrEmail")}
          className="form-input"
        />
        {errors.usernameOrEmail && (
          <p className="error-message">{errors.usernameOrEmail.message}</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">رمز عبور</label>
        <input
          type="password"
          placeholder="*****************"
          {...register("password")}
          className="form-input"
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="remember-forgot">
        <label className="remember-me">
          مرا به خاطر بسپار
          <input
            type="checkbox"
            {...register("rememberMe")}
          />
        </label>
        <a href="#" className="forgot-password">رمز عبور را فراموش کرده‌اید؟</a>
      </div>

      <button type="submit" className="submit-button">
        ورود
      </button>
    </form>
  );
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onSubmit",
  });

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">ایمیل</label>
        <input
          type="email"
          placeholder="ایمیل خود را وارد کنید"
          {...register("email")}
          className="form-input"
        />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">نام کاربری</label>
        <input
          type="text"
          placeholder="نام کاربری خود را وارد کنید"
          {...register("username")}
          className="form-input"
        />
        {errors.username && (
          <p className="error-message">{errors.username.message}</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">رمز عبور</label>
        <input
          type="password"
          placeholder="*****************"
          {...register("password")}
          className="form-input"
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <button type="submit" className="submit-button">
        ادامه
      </button>
    </form>
  );
};

const OptionalSignUpForm: React.FC<OptionalSignUpFormProps> = ({ onSubmit, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OptionalFormData>({
    resolver: yupResolver(optionalSchema as any), // Temporary fix for type compatibility
    mode: "onSubmit",
    defaultValues: {
      firstName: undefined,
      lastName: undefined,
      studentNo: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">نام (اختیاری)</label>
        <input
          type="text"
          placeholder="نام خود را وارد کنید (اختیاری)"
          {...register("firstName")}
          className="form-input"
        />
        {errors.firstName && (
          <p className="error-message">{errors.firstName.message}</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">نام خانوادگی (اختیاری)</label>
        <input
          type="text"
          placeholder="نام خانوادگی خود را وارد کنید (اختیاری)"
          {...register("lastName")}
          className="form-input"
        />
        {errors.lastName && (
          <p className="error-message">{errors.lastName.message}</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">شماره دانشجویی (اختیاری)</label>
        <input
          type="text"
          placeholder="شماره دانشجویی 9 رقمی (اختیاری)"
          {...register("studentNo")}
          className="form-input"
        />
        {errors.studentNo && (
          <p className="error-message">{errors.studentNo.message}</p>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
        >
          تکمیل ثبت‌نام
        </button>
        <button
          type="button"
          onClick={onBack}
          className="back-button"
        >
          بازگشت
        </button>
      </div>
    </form>
  );
};

// Main Component
type FormMode = "login" | "signup" | "optional";

const RegisterPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<FormMode>("login");
  const [mainFormData, setMainFormData] = useState<SignUpFormData | null>(null);
  const [isComingFromOptional, setIsComingFromOptional] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (data: LoginFormData) => {
    console.log("Login form submitted:", data);
    navigate("/");
  };

  const handleSignUpSubmit = (data: SignUpFormData) => {
    console.log("SignUp form submitted:", data);
    setMainFormData(data);
    setIsComingFromOptional(false);
    setCurrentMode("optional");
  };

  const handleOptionalSubmit = (data: OptionalFormData) => {
    console.log("Optional form submitted:", data);
    console.log("Combined data:", {
      ...mainFormData,
      ...data
    });
    setMainFormData(null);
    setIsComingFromOptional(false);
    navigate("/");
  };

  const handleBackToSignUp = () => {
    setIsComingFromOptional(true);
    setCurrentMode("signup");
  };

  const handleTabChange = (mode: "signup" | "login") => {
    if (mode === "login") {
      setMainFormData(null);
      setIsComingFromOptional(false);
    }
    setCurrentMode(mode);
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="login-card">
        <div className="tabs-container">
          <button
            onClick={() => handleTabChange("signup")}
            className={`tab-button ${
              currentMode === "signup" || currentMode === "optional" ? "active" : ""
            }`}
          >
            ثبت‌نام
          </button>
          <button
            onClick={() => handleTabChange("login")}
            className={`tab-button ${currentMode === "login" ? "active" : ""}`}
          >
            ورود
          </button>
        </div>

        {currentMode === "login" && (
          <LoginForm onSubmit={handleLoginSubmit} />
        )}
        {currentMode === "signup" && (
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            defaultValues={isComingFromOptional ? mainFormData || undefined : undefined}
          />
        )}
        {currentMode === "optional" && (
          <OptionalSignUpForm
            onSubmit={handleOptionalSubmit}
            onBack={handleBackToSignUp}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;