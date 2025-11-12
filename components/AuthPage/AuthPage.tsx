// components/AuthPage/AuthPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import "./AuthPage.css"; 
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaFacebookF,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

// === DỮ LIỆU NGÔN NGỮ ===
const langData = {
    en: {
        signUpTitle: "Create Account",
        signInTitle: "Sign in",
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot your password?",
        signUpBtn: "Sign Up",
        signInBtn: "Sign In",
        orRegisterWith: "or register with",
        orSignInWith: "or sign in with",
        overlayWelcome: "Welcome!",
        overlaySignInP: "To keep connected with us please sign in with your personal info",
        overlayHello: "Hello!",
        overlaySignUpP: "Sign in to discover new experiences",
        errValidation: "Please check the information entered",
        errUsername: "Please enter username",
        errEmail: "Please enter email",
        errInvalidEmail: "Invalid email",
        errPassword: "Please enter password",
        errPasswordLength: "Password must be at least 6 characters",
        errConfirmPassword: "Please confirm password",
        errPasswordMismatch: "Passwords do not match",
        errAuthFailed: "Authentication failed. Please try again.",
        errUnknown: "An unknown error occurred.",
        errServer: "Cannot connect to server.",
        successRegister: "Registration successful! Please log in.",
        successLogin: "Login successful!",
        loading: "Signing in..."
    },
    vn: {
        signUpTitle: "Tạo tài khoản",
        signInTitle: "Đăng nhập",
        username: "Tên đăng nhập",
        email: "Email",
        password: "Mật khẩu",
        confirmPassword: "Xác nhận Mật khẩu",
        forgotPassword: "Quên mật khẩu?",
        signUpBtn: "Đăng Ký",
        signInBtn: "Đăng Nhập",
        orRegisterWith: "hoặc đăng ký bằng",
        orSignInWith: "hoặc đăng nhập bằng",
        overlayWelcome: "Chào mừng!",
        overlaySignInP: "Để duy trì kết nối, vui lòng đăng nhập bằng thông tin cá nhân của bạn",
        overlayHello: "Xin chào!",
        overlaySignUpP: "Đăng ký để khám phá những trải nghiệm mới",
        errValidation: "Vui lòng kiểm tra lại thông tin đã nhập",
        errUsername: "Vui lòng nhập tên đăng nhập",
        errEmail: "Vui lòng nhập email",
        errInvalidEmail: "Email không hợp lệ",
        errPassword: "Vui lòng nhập mật khẩu",
        errPasswordLength: "Mật khẩu phải có ít nhất 6 ký tự",
        errConfirmPassword: "Vui lòng xác nhận mật khẩu",
        errPasswordMismatch: "Mật khẩu không khớp",
        errAuthFailed: "Xác thực thất bại. Vui lòng thử lại.",
        errUnknown: "Đã xảy ra lỗi không xác định.",
        errServer: "Không thể kết nối tới máy chủ.",
        successRegister: "Đăng ký thành công! Vui lòng đăng nhập.",
        successLogin: "Đăng nhập thành công!",
        loading: "Đang đăng nhập..."
    }
};
// =====================================


const AuthForm: React.FC = () => {
  const router = useRouter();
  const { setUser, currentLang } = useAuth(); 
  const T = langData[currentLang]; 

  // --- State cho Form (Giữ nguyên) ---
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem("accessToken");
        if (token) {
          router.push("/");
        }
    }
  }, [router]);

  // --- Hàm xử lý ---

  const toggleForm = (isRegister: boolean) => {
    setIsRegisterActive(isRegister);
    setErrors({});
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  // Hàm kiểm tra lỗi (Dùng T cho thông báo lỗi)
  const validate = (isRegisterForm: boolean) => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isRegisterForm) {
      if (!username) newErrors.username = T.errUsername;
    }
    if (!email) {
      newErrors.email = T.errEmail;
    } else if (!emailRegex.test(email)) {
      newErrors.email = T.errInvalidEmail;
    }
    if (!password) {
      newErrors.password = T.errPassword;
    } else if (password.length < 6) {
      newErrors.password = T.errPasswordLength;
    }
    if (isRegisterForm) {
      if (!confirmPassword) {
        newErrors.confirmPassword = T.errConfirmPassword;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = T.errPasswordMismatch;
      }
    }
    return newErrors;
  };

  // Hàm Submit (Dùng T cho thông báo toast)
  const handleSubmit = async (e: React.FormEvent, isRegisterForm: boolean) => {
    e.preventDefault();
    const validationErrors = validate(isRegisterForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(T.errValidation);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (isRegisterForm) {
        // --- GỌI API ĐĂNG KÝ ---
        const response = await api.post("/auth/register", {
          username,
          email,
          password,
        });
        toast.success(T.successRegister);
        toggleForm(false);
      } else {
        // --- GỌI API ĐĂNG NHẬP ---
        const loginResponse = await api.post("/auth/login", {
          email,
          password,
        });
        
        toast.success(T.successLogin);
        if (typeof window !== 'undefined') {
            localStorage.setItem("accessToken", loginResponse.data.accessToken);
            localStorage.setItem("refreshToken", loginResponse.data.refreshToken);
        }

        const profileResponse = await api.get("/auth/profile");
        setUser(profileResponse.data);
        router.push("/");
      }
    } catch (error: any) {
      // --- XỬ LÝ LỖI (Dùng T cho thông báo lỗi) ---
      console.error("Lỗi xác thực:", error);
      let errorMessage = T.errUnknown;
      if (error.response && error.response.data) {
        const serverError = error.response.data.message;
        if (typeof serverError === "string") {
          errorMessage = serverError;
        } else if (Array.isArray(serverError)) {
          errorMessage = serverError.join(", ");
        }
      } else {
        errorMessage = T.errServer;
      }
      toast.error(errorMessage);
      setErrors({ api: errorMessage });
      // ----------------------------------------------------
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div
        className={`auth-container ${
          isRegisterActive ? "register-active" : ""
        }`}
      >
        {/* FORM ĐĂNG KÝ (REGISTER) */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <h1>{T.signUpTitle}</h1> 
            {/* Input Username */}
            <div className="input-group">
              <FaUser />
              <input
                type="text"
                placeholder={T.username} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
            {/* Input Email */}
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder={T.email} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
            {/* Input Password */}
            <div className="input-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={T.password} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            {/* Input Confirm Password */}
            <div className="input-group">
              <FaLock />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={T.confirmPassword} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
            {errors.api && (
              <div className="error-message api-error">{errors.api}</div>
            )}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? T.loading : T.signUpBtn} 
            </button>
            <div className="form-separator">
              <span>{T.orRegisterWith}</span> 
            </div>
            <div className="social-container">
              <a href="#" className="social-icon facebook-hover">
                <FaFacebookF />
              </a>
              <a
                href="http://localhost:3001/auth/google"
                className="social-icon google-hover"
              >
                <FcGoogle />
              </a>
            </div>
          </form>
        </div>

        {/* FORM ĐĂNG NHẬP (LOGIN) */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <h1>{T.signInTitle}</h1> 
            {/* Input Email */}
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder={T.email} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
            {/* Input Password */}
            <div className="input-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={T.password} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
            <a href="#" className="forgot-password">
              {T.forgotPassword} 
            </a>
            {errors.api && (
              <div className="error-message api-error">{errors.api}</div>
            )}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? T.loading : T.signInBtn} 
            </button>
            <div className="form-separator">
              <span>{T.orSignInWith}</span> 
            </div>
            <div className="social-container">
              <a href="#" className="social-icon facebook-hover">
                <FaFacebookF />
              </a>
              <a
                href="http://localhost:3001/auth/google"
                className="social-icon google-hover"
              >
                <FcGoogle />
              </a>
            </div>
          </form>
        </div>

        {/* PHẦN OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>{T.overlayWelcome}</h1> 
              <p>
                {T.overlaySignInP} 
              </p>
              <button
                className="ghost-button"
                onClick={() => toggleForm(false)}
              >
                {T.signInBtn}
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>{T.overlayHello}</h1> 
              <p>{T.overlaySignUpP}</p> 
              <button className="ghost-button" onClick={() => toggleForm(true)}>
                {T.signUpBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;