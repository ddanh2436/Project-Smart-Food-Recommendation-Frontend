// components/Footer/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      
      {/* === PHẦN 1: CTA SECTION (MINIMALIST) === */}
      <div className="footer-cta-minimal">
        <div className="cta-content">
          <h2 className="cta-title">Tinh hoa Ẩm thực Việt</h2>
          <p className="cta-desc">
            Kết nối đam mê, chia sẻ hương vị. Khám phá câu chuyện đằng sau mỗi món ăn cùng VietNomNom.
          </p>
          <Link href="/about-us" className="btn-cta-outline">
            Khám phá câu chuyện của chúng tôi
          </Link>
        </div>
      </div>

      {/* === PHẦN 2: MAIN CONTENT === */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Cột 1: Brand & Socials */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
               {/* Logo trắng (dùng filter trong CSS hoặc ảnh trắng) */}
              <Image
                src="/assets/image/logo.png"
                alt="VietNomNom Logo"
                width={160}
                height={60}
                className="footer-logo-img"
              />
            </div>
            <p className="brand-desc">
              Trải nghiệm ẩm thực chân thực nhất, được tuyển chọn kỹ lưỡng dành cho bạn.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Youtube"><FaYoutube /></a>
            </div>
          </div>

          {/* Cột 2: Quick Links */}
          <div className="footer-col">
            <h3 className="footer-heading">Khám phá</h3>
            <ul className="footer-links">
              <li><Link href="/about-us">Về chúng tôi</Link></li>
              <li><Link href="/restaurants">Nhà hàng</Link></li>
              <li><Link href="/blog">Góc ẩm thực</Link></li>
              <li><Link href="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 3: Policy */}
          <div className="footer-col">
            <h3 className="footer-heading">Chính sách</h3>
            <ul className="footer-links">
              <li><Link href="#">Điều khoản sử dụng</Link></li>
              <li><Link href="#">Chính sách bảo mật</Link></li>
              <li><Link href="#">Cookies</Link></li>
              <li><Link href="#">Hỗ trợ khách hàng</Link></li>
            </ul>
          </div>

          {/* Cột 4: Contact & Payment */}
          <div className="footer-col contact-col">
            <h3 className="footer-heading">Liên hệ</h3>
            <ul className="contact-info">
              <li>227 Nguyễn Văn Cừ, Q.5, TP.HCM</li>
              <li>(+84) 943 192 824</li>
              <li>duyanhz2412@gmail.com</li>
            </ul>
            <div className="payment-methods">
               <FaCcVisa />
               <FaCcMastercard />
               <FaCcAmex />
               <FaCcPaypal />
            </div>
          </div>
        </div>

        {/* === PHẦN 3: BOTTOM BAR === */}
        <div className="footer-bottom">
          <div className="copyright">
            © 2025 VietNomNom. All rights reserved.
          </div>
          <div className="designer">
            Designed with <span className="heart">♥</span> by Group 6-24C11-HCMUS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;