// components/Footer/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
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
      {/* === PHẦN 1: CTA SECTION (Đã cập nhật nội dung) === */}
      <div className="footer-cta-section">
        <div className="footer-cta-overlay"></div>
        <div className="footer-cta-content">
          
          {/* TIÊU ĐỀ MỚI */}
          <h2>Tinh hoa Ẩm thực Việt & Hành trình Đam mê</h2>
          
          {/* ĐOẠN VĂN GIỚI THIỆU MỚI */}
          <p>
            Từ những gánh hàng rong bình dị đến tinh hoa ẩm thực đương đại. 
            VietNomNom ra đời từ niềm khát khao kết nối mọi người qua từng hương vị 
            đậm đà bản sắc, mang đến cho bạn những trải nghiệm chân thực nhất.
          </p>
          
          <Link href="/about-us" className="btn-find-restaurant">
            Khám phá câu chuyện của chúng tôi
          </Link>
        </div>
      </div>

      {/* === PHẦN 2: MAIN INFO (Giữ nguyên) === */}
      <div className="footer-main-content">
        <div className="footer-container">
          
          {/* Cột 1: Logo & Contact */}
          <div className="footer-col footer-contact-col">
            <div className="footer-logo">
              <Image
                src="/assets/image/logo.png"
                alt="VietNomNom Logo"
                width={150}
                height={50}
                className="footer-logo-img"
              />
            </div>
            <h3 className="footer-heading">Contact</h3>
            <ul className="contact-list">
              <li>
                <strong>Address:</strong> 227 Nguyen Van Cu, Phuong 4, District 5,
                HCM city
              </li>
              <li>
                <strong>Phone:</strong> 0943192824 / (+84) 943192824
              </li>
              <li>
                <strong>Work hours:</strong> 10:00 - 18:00, Mon- Sat
              </li>
            </ul>
            
            <div className="footer-socials">
              <p>Follow Us</p>
              <div className="social-icons">
                <a href="#"><FaFacebookF /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaInstagram /></a>
                <a href="#"><FaPinterestP /></a>
                <a href="#"><FaYoutube /></a>
              </div>
            </div>
          </div>

          {/* Cột 2: Address (Links) */}
          <div className="footer-col">
            <h3 className="footer-heading">Address</h3>
            <ul className="footer-links">
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="#">Delivery Information</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms & Conditions</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Support Center</Link></li>
            </ul>
          </div>

          {/* Cột 3: My Account */}
          <div className="footer-col">
            <h3 className="footer-heading">My Account</h3>
            <ul className="footer-links">
              <li><Link href="/auth">Sign In</Link></li>
              <li><Link href="#">View Cart</Link></li>
              <li><Link href="#">My Wishlist</Link></li>
              <li><Link href="#">Track my order</Link></li>
              <li><Link href="#">Help</Link></li>
              <li><Link href="#">Order</Link></li>
            </ul>
          </div>

          {/* Cột 4: Payment Gateways */}
          <div className="footer-col">
            <h3 className="footer-heading">Secured Payment Gateways</h3>
            <div className="payment-icons">
               <FaCcVisa className="pay-icon" />
               <FaCcMastercard className="pay-icon" />
               <FaCcAmex className="pay-icon" />
               <FaCcPaypal className="pay-icon" />
            </div>
          </div>
        </div>

        {/* === PHẦN 3: COPYRIGHT === */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            ©2025 VietNomNom. All rights reserved
          </div>
          <div className="designer-text">
            Designed by: Dao Duy Anh
          </div>
          <div className="inspiration-text">
            Inspiration by: Youtube
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;