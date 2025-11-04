"use client";

import React, { useState, useEffect } from "react";
import "./AuthPage.css"; // [cite: AuthPage.css]
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext"; // 1. IMPORT USEAUTH

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaFacebookF,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const AuthForm: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuth(); // 2. LẤY HÀM SETUSER TỪ CONTEXT

  // --- State cho Form ---
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State cho dữ liệu input
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State cho lỗi validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // State cho hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Tự động kiểm tra khi trang tải
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Bỏ toast ở đây để tránh thông báo liên tục khi vô tình vào /auth
      // toast.success("Bạn đã đăng nhập!"); 
      router.push("/");
    }
  }, [router]);

  // --- Hàm xử lý ---

  // Hàm chuyển đổi form (Login/Register)
  const toggleForm = (isRegister: boolean) => {
    setIsRegisterActive(isRegister);
    setErrors({});
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  // Hàm kiểm tra lỗi (Validation)
  const validate = (isRegisterForm: boolean) => {
    // ... (Code validate của bạn đã đúng, giữ nguyên)
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isRegisterForm) {
      if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập";
    }
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (isRegisterForm) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu không khớp";
      }
    }
    return newErrors;
  };

  // Hàm Submit (Chung)
  const handleSubmit = async (e: React.FormEvent, isRegisterForm: boolean) => {
    e.preventDefault();
    const validationErrors = validate(isRegisterForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
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
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        toggleForm(false); // Chuyển sang form đăng nhập
      } else {
        // --- GỌI API ĐĂNG NHẬP (ĐÃ SỬA) ---
        const loginResponse = await api.post("/auth/login", {
          email,
          password,
        });
        
        toast.success("Đăng nhập thành công!");

        // 3. LƯU TOKEN
        localStorage.setItem("accessToken", loginResponse.data.accessToken);
        localStorage.setItem("refreshToken", loginResponse.data.refreshToken);

        // 4. LẤY PROFILE NGAY LẬP TỨC
        // api.ts sẽ tự động đính kèm token bạn vừa lưu
        const profileResponse = await api.get("/auth/profile");
        
        // 5. CẬP NHẬT GLOBAL STATE
        setUser(profileResponse.data);

        // 6. ĐIỀU HƯỚNG
        router.push("/");
      }
    } catch (error: any) {
      // ... (Code xử lý lỗi của bạn đã đúng, giữ nguyên)
      console.error("Lỗi xác thực:", error);
      let errorMessage = "Đã xảy ra lỗi không xác định.";
      if (error.response && error.response.data) {
        const serverError = error.response.data.message;
        if (typeof serverError === "string") {
          errorMessage = serverError;
        } else if (Array.isArray(serverError)) {
          errorMessage = serverError.join(", ");
        }
      } else {
        errorMessage = "Không thể kết nối tới máy chủ.";
      }
      toast.error(errorMessage);
      setErrors({ api: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (TOÀN BỘ PHẦN JSX CỦA BẠN GIỮ NGUYÊN) ...
    // ... (Vì code JSX bạn gửi đã đúng) ...
    <div className="auth-page-container">
      <div
        className={`auth-container ${
          isRegisterActive ? "register-active" : ""
        }`}
      >
        {/* FORM ĐĂNG KÝ (REGISTER) */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, true)}>
            <h1>Create Account</h1>
            <div className="input-group">
              <FaUser />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
            <div className="input-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
            <div className="input-group">
              <FaLock />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
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
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
            <div className="form-separator">
              <span>or register with</span>
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
            <h1>Sign in</h1>
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
            <div className="input-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
              Forgot your password?
            </a>
            {errors.api && (
              <div className="error-message api-error">{errors.api}</div>
            )}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
            <div className="form-separator">
              <span>or sign in with</span>
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
              <h1>Welcome!</h1>
              <p>
                To keep connected with us please sign in with your personal info
              </p>
              <button
                className="ghost-button"
                onClick={() => toggleForm(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello!</h1>
              <p>Sign in to discover new experiences</p>
              <button className="ghost-button" onClick={() => toggleForm(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

