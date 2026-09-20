// components/Footer/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { useTranslation } from "@/app/hooks/useTranslation";
import "./Footer.css";

const SOCIALS = [
  { href: "https://www.facebook.com/vietnomnom", name: "Facebook", Icon: FaFacebookF },
  { href: "https://www.instagram.com/vietnomnom", name: "Instagram", Icon: FaInstagram },
  { href: "https://www.tiktok.com/@vietnomnom", name: "TikTok", Icon: FaTiktok },
  { href: "https://www.youtube.com/@vietnomnom", name: "YouTube", Icon: FaYoutube },
];

const Footer = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  // The About page already opens with this invitation, so repeating it at the
  // bottom of the same page would send the reader where they already are.
  const showCta = pathname !== "/about-us";

  return (
    <footer className="footer-wrapper">
      {showCta && (
        <div className="footer-cta-minimal">
          <div className="cta-content">
            {/* Was "Tinh hoa Ẩm thực Việt", word for word the same as the
                hero headline, so the page said the same thing twice. This
                banner has a different job: it introduces the team. */}
            <h2 className="cta-title">{t.footer.ctaTitle}</h2>
            <p className="cta-desc">{t.footer.ctaDesc}</p>
            {/* Solid amber rather than a thin outline: a ghost button on a dark
                photo had almost no pull. */}
            <Link href="/about-us" className="btn-cta-solid">
              {t.footer.ctaBtn}
            </Link>
          </div>
        </div>
      )}

      <div className="footer-main">
        <div className="footer-container">
          {/* Brand & socials */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <Image
                src="/assets/image/logo.png"
                alt="VietNomNom"
                width={160}
                height={60}
                className="footer-logo-img"
              />
            </div>
            <p className="brand-desc">{t.footer.brandDesc}</p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h3 className="footer-heading">{t.footer.explore}</h3>
            <ul className="footer-links">
              <li><Link href="/about-us">{t.nav.aboutUs}</Link></li>
              <li><Link href="/restaurants">{t.nav.restaurants}</Link></li>
              <li><Link href="/blog">{t.footer.blog}</Link></li>
              <li><Link href="/contact">{t.footer.contact}</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div className="footer-col">
            <h3 className="footer-heading">{t.footer.policy}</h3>
            <ul className="footer-links">
              <li><Link href="#">{t.footer.terms}</Link></li>
              <li><Link href="#">{t.footer.privacy}</Link></li>
              <li><Link href="#">{t.footer.cookies}</Link></li>
              <li><Link href="#">{t.footer.support}</Link></li>
            </ul>
          </div>

          {/* Contact & payment */}
          <div className="footer-col contact-col">
            <h3 className="footer-heading">{t.footer.contact}</h3>
            {/* Personal mobile and a gmail address made the site read as a
                student project; these are the shapes a real service uses. */}
            <ul className="contact-info">
              <li>{t.footer.address}</li>
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
              {SOCIALS.map(({ href, name, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`VietNomNom ${t.footer.socialOn} ${name}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
            <div className="payment-methods">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcAmex />
              <FaCcPaypal />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © 2025 VietNomNom. {t.footer.rights}
          </div>
          <div className="designer">
            {t.footer.designed} <span className="heart">♥</span> Group 6-24C11-HCMUS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
