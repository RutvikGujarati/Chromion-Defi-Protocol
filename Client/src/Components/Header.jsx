import React from "react";
import { NavLink } from "react-router-dom";
import "../Styles/Header.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <header className="header fixed-top">
      <div className="container-fluid px-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between py-3">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="logo-link text-decoration-none">
              <span className="logo-text">NovaDapp</span>
            </NavLink>
          </div>

          {/* Center - Nav Links */}
          <nav className="d-none d-md-flex gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              About
            </NavLink>
          </nav>

          {/* Right - Wallet */}
          <div className="wallet-button">
            <ConnectButton />
          </div>

          {/* Mobile Nav Links */}
          <div className="w-100 d-md-none mt-3 d-flex justify-content-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              About
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
