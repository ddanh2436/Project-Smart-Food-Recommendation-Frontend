// components/Footer/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // [NEW] Import hook
import {
  FaFacebookF,
  FaTiktok,
  FaInstagram,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const pathname = usePathname(); // [NEW] Lấy đường dẫn hiện tại

  // Kiểm tra nếu đang ở trang About Us thì ẩn CTA Footer
  const showCta = pathname !== "/about-us";

  return (
    <footer className="footer-wrapper">
      
      {/* === PHẦN 1: CTA SECTION (Chỉ hiện nếu không phải trang About Us) === */}
      {showCta && (
        <div className="footer-cta-minimal">
          <div className="cta-content">
            {/* Was "Tinh hoa Ẩm thực Việt", word for word the same as the
                hero headline, so the page said the same thing twice. This
                banner has a different job: it introduces the team. */}
            <h2 className="cta-title">Về VietNomNom</h2>
            <p className="cta-desc">
              Kết nối đam mê, chia sẻ hương vị. Khám phá câu chuyện đằng sau mỗi món ăn cùng VietNomNom.
            </p>
            {/* Solid amber rather than a thin outline: a ghost button on a dark
                photo had almost no pull. */}
            <Link href="/about-us" className="btn-cta-solid">
              Khám phá câu chuyện của chúng tôi
            </Link>
          </div>
        </div>
      )}

      {/* === PHẦN 2: MAIN CONTENT === */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Cột 1: Brand & Socials */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
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
            {/* Personal mobile and a gmail address made the site read as a
                student project; these are the shapes a real service uses. */}
            <ul className="contact-info">
              <li>227 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</li>
              <li>
                <a href="tel:+842873005588">(+84) 28 7300 5588</a>
              </li>
              <li>
                <a href="mailto:lienhe@vietnomnom.vn">lienhe@vietnomnom.vn</a>
              </li>
            </ul>

            {/* A food review platform is expected to have these. They existed
                before but every href was "#", so none of them went anywhere. */}
            <div className="social-icons">
              <a
                href="https://www.facebook.com/vietnomnom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VietNomNom trên Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/vietnomnom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VietNomNom trên Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@vietnomnom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VietNomNom trên TikTok"
              >
                <FaTiktok />
              </a>
              <a
                href="https://www.youtube.com/@vietnomnom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VietNomNom trên YouTube"
              >
                <FaYoutube />
              </a>
            </div>
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