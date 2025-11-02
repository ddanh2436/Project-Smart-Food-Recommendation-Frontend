"use client";

import React, { useState } from "react";
import "./AuthPage.css";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
  // --- State cho Form ---
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State cho dữ liệu input
  // const [name, setName] = useState(""); // <-- Chúng ta chưa dùng 'name' ở backend
  const [username, setUsername] = useState(""); // <-- SỬA: Thêm state cho username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State cho lỗi validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // State cho hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Hàm xử lý ---

  // Hàm chuyển đổi form (Login/Register)
  const toggleForm = (isRegister: boolean) => {
    setIsRegisterActive(isRegister);
    setErrors({});
    // setName("");
    setUsername(""); // <-- Reset username
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  // Hàm kiểm tra lỗi (Validation)
  const validate = (isRegisterForm: boolean) => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isRegisterForm) {
      if (!username) newErrors.username = "Vui lòng nhập tên đăng nhập"; // <-- Thêm validate username
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

  // 2. SỬA LẠI HÀM HANDLESUBMIT
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
      let response;
      if (isRegisterForm) {
        // --- GỌI API ĐĂNG KÝ ---
        response = await api.post("/auth/register", {
          username, // <-- Gửi username
          email,
          password,
        });
        console.log("Đăng ký thành công:", response.data);
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        toggleForm(false); // Chuyển sang form đăng nhập sau khi đăng ký
      } else {
        // --- GỌI API ĐĂNG NHẬP ---
        response = await api.post("/auth/login", {
          email,
          password,
        });
        toast.success("Đăng nhập thành công!");

        // 3. LƯU TOKENS
        // Đây là bước quan trọng nhất sau khi đăng nhập
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        router.push("/");
      }
    } catch (error: any) {
      console.error("Lỗi xác thực:", error);
      // Xử lý lỗi từ backend
      if (error.response && error.response.data) {
        const serverError = error.response.data.message;
        if (typeof serverError === "string") {
          // Lỗi chung (ví dụ: 'Email already exists' hoặc 'Invalid credentials')
          setErrors({ api: serverError });
        } else if (Array.isArray(serverError)) {
          // Lỗi validation từ class-validator
          setErrors({ api: serverError.join(", ") });
        } else {
          setErrors({ api: "Đã xảy ra lỗi không xác định." });
        }
      } else {
        setErrors({ api: "Không thể kết nối tới máy chủ." });
      }
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
            <h1>Create Account</h1>

            {/* 4. THÊM Ô INPUT USERNAME */}
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

            {/* Input Email */}
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Email" // Đổi từ 'Email or username'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}

            {/* Input Mật khẩu */}
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

            {/* Ô CONFIRM PASSWORD */}
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

            {/* 5. HIỂN THỊ LỖI API CHUNG */}
            {errors.api && (
              <div className="error-message api-error">{errors.api}</div>
            )}

            {/* Social (để sau input cho hợp lý) */}
            <div className="social-container">
              <a href="#" className="social-icon facebook-hover">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon google-hover">
                <FcGoogle />
              </a>
            </div>
            <span>or use your email for registration</span>

            {/* Nút Submit */}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* FORM ĐĂNG NHẬP (LOGIN) */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <h1>Sign in</h1>

            {/* Input Email */}
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

            {/* Input Mật khẩu */}
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

            {/* 5. HIỂN THỊ LỖI API CHUNG */}
            {errors.api && (
              <div className="error-message api-error">{errors.api}</div>
            )}

            {/* Social */}
            <div className="social-container">
              <a href="#" className="social-icon facebook-hover">
                <FaFacebookF />
              </a>
              <a href="#" className="social-icon google-hover">
                <FcGoogle />
              </a>
            </div>

            <a href="#" className="forgot-password">
              Forgot your password?
            </a>

            {/* Nút Submit */}
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* PHẦN OVERLAY (đã cập nhật onClick) */}
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
