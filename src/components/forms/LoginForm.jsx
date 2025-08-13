import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./style/LoginForm.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [emailloginError, setEmailloginError] = useState("");
  const [passwordloginError, setPasswordloginError] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    setEmailloginError("");
    setPasswordloginError("");
    setLoginError("");

    let valid = true;

    if (!validateEmail(formData.email)) {
      setEmailloginError("Please enter a valid email.");
      valid = false;
    }

    if (!validatePassword(formData.password)) {
      setPasswordloginError("Password must be at least 6 characters long.");
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data || "Invalid credentials. Please try again.");
      } else {
        const token = data.token;
        if (token) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("Token saved in localStorage:", token);

          const keepLoggedIn = event.target.checkbox.checked;
          if (keepLoggedIn) {
            localStorage.setItem("keepLoggedIn", "true");
          }
          console.log("Navigating to home...");

          navigate("/home");
        } else {
          setLoginError("Login failed. Token was not received.");
        }
      }
    } catch (error) {
      console.error("Error during login request:", error);
      setLoginError(
        "There was an error with the login request. Please try again later."
      );
    }
  };
  return (
  
     <div className="login-page">
      <Container>
        <div className="blue-box"></div>

        <div className="login-form">
          <h1>Login</h1>

          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                aria-describedby="email-error"
              />
              {emailloginError && (
                <p id="email-error" className="mt-1 text-danger">
                  {emailloginError}
                </p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                aria-describedby="password-error"
              />
              {passwordloginError && (
                <p id="password-error" className="mt-1 text-danger">
                  {passwordloginError}
                </p>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="checkbox">
              <Form.Check
                className="text-dark mb-0"
                type="checkbox"
                label="Keep me logged in"
              />
            </Form.Group>

            <Button
              variant="border border-light"
              className="w-100 login-button"
              type="submit"
            >
              Login
            </Button>

            {loginError && <p className="mt-3 text-danger">{loginError}</p>}

            <div>
              <h6 className="my-4 text-dark text-center">
                Don't have an Account?{" "}
                <Link to="/register" className="text-decoration-none">
                  Sign Up
                </Link>
              </h6>
            </div>
          </Form>
        </div>
      </Container>
    
   </div>
  );
};

export default LoginForm;
