import React from "react";
import { NavLink } from "react-router-dom";
import "../Styles/Header.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <header className="header fixed-top shadow-sm">
      <div className="container-fluid px-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between py-3">
          <div className="flex-shrink-0">
            <NavLink to="/" className="logo-link text-decoration-none">
              <span className="logo-text">NovaDapp</span>
            </NavLink>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-center gap-3 ms-auto">
            <nav className="d-none d-md-flex gap-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Bridge
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

            <div className="wallet-button">
              <ConnectButton showBalance={false} />
            </div>

            <div className="d-md-none w-100 d-flex justify-content-center gap-4 border-top pt-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Bridge
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
      </div>
    </header>
  );
};

export default Header;
