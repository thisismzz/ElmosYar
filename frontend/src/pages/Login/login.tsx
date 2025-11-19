import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import './login.css';

// Interfaces
interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
}

// Validation Schemas
const loginSchema = yup.object({
  username: yup
    .string()
    .required("نام کاربری الزامی است"),
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
  repeatPassword: yup
    .string()
    .required("تکرار رمز عبور الزامی است")
    .oneOf([yup.ref('password')], "رمز عبور و تکرار آن باید یکسان باشند"),
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
        <input
          type="text"
          placeholder="نام کاربری"
          {...register("username")}
          className={`form-input ${errors.username ? 'error' : ''}`}
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
          />
          مرا به خاطر بسپار
        </label>
        <a href="#" className="forgot-password">فراموشی رمز عبور؟</a>
      </div>

      <button type="submit" className="submit-button">
        ورود
      </button>
    </form>
  );
};

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onSubmit",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <input
          type="email"
          placeholder="ایمیل"
          {...register("email")}
          className={`form-input ${errors.email ? 'error' : ''}`}
        />
        {errors.email && (
          <p className="error-message">{errors.email.message}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="نام کاربری"
          {...register("username")}
          className={`form-input ${errors.username ? 'error' : ''}`}
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
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="تکرار رمز عبور"
          {...register("repeatPassword")}
          className={`form-input ${errors.repeatPassword ? 'error' : ''}`}
        />
        {errors.repeatPassword && (
          <p className="error-message">{errors.repeatPassword.message}</p>
        )}
      </div>

      <button type="submit" className="submit-button">
        ثبت‌نام
      </button>
    </form>
  );
};

// Main Component
type FormMode = "login" | "signup";

const RegisterPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<FormMode>("login");
  const navigate = useNavigate();

  const handleLoginSubmit = (data: LoginFormData) => {
    console.log("Login form submitted:", data);
    navigate("/");
  };

  const handleSignUpSubmit = (data: SignUpFormData) => {
    console.log("SignUp form submitted:", data);
    const { repeatPassword, ...signUpData } = data;
    console.log("Data to send to backend:", signUpData);
    navigate("/");
  };

  const handleTabChange = (mode: FormMode) => {
    setCurrentMode(mode);
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
          <SignUpForm onSubmit={handleSignUpSubmit} />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;