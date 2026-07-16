import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-calendar-check me-2" />
          AppointmentBook
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {isLoggedIn ? (
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <Link className="nav-link" to="/slots">
                  <i className="bi bi-grid me-1" />
                  Slots
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">
                  <i className="bi bi-journal-check me-1" />
                  My Bookings
                </Link>
              </li>
              <li className="nav-item">
                <span className="navbar-text text-white-50 me-2">
                  Hi, {user?.name}
                </span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-light btn-sm" to="/register">Register</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
