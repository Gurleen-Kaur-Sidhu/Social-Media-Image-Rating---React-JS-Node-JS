import React, { useState } from "react";
import { Col, Form, Button, Row, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./style/LoginForm.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileimage: null,
    bio: "",
  });

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupError, setSignupError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileimage: e.target.files[0] });
  };

  const validateUsername = (username) => {
    return username.trim() !== "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleCheckboxChange = (e) => {
    setAcceptTerms(e.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSignupError("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let valid = true;

    if (!validateUsername(formData.username)) {
      setUsernameError("Please enter a username.");
      valid = false;
    }

    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }

    if (!validatePassword(formData.password)) {
      setPasswordError("Password must be at least 6 characters long.");
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    if (!acceptTerms) {
      setSignupError("Please accept the terms and conditions.");
      valid = false;
    }

    if (!valid) {
      return;
    }

    const requestData = new FormData();
    requestData.append("username", formData.username);
    requestData.append("email", formData.email);
    requestData.append("password", formData.password);
    requestData.append("profileimage", formData.profileimage);
    requestData.append("bio", formData.bio);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}register`, {
        method: "POST",
        body: requestData,
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(data.message || "Signup failed. Please try again.");
      } else {
        console.log("Signup successful!", data);
        navigate("/login");
      }
    } catch (error) {
      console.log("Error during signup request:", error);
      setSignupError(
        "There was an error with the signup request. Please try again later."
      );
    }
  };
  return (
   
    <div className="register-page">
      <Container>
        <div className="blue-box"></div>

        <div className="register-form">
          <h1>Sign Up</h1>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3 w-100">
              <Form.Control
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {usernameError && <p className="mt-1 text-danger">{usernameError}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {emailError && <p className="mt-1 text-danger">{emailError}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {passwordError && <p className="mt-1 text-danger">{passwordError}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {confirmPasswordError && (
                <p className="mt-1 text-danger">{confirmPasswordError}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark h6">Profile image:</Form.Label>
              <Form.Control
                type="file"
                name="profileimage"
                onChange={handleFileChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark h6">Bio:</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="" controlId="checkbox">
              <Form.Check
                type="checkbox"
                className="text-dark"
                label="I accept all terms and conditions"
                checked={acceptTerms}
                onChange={handleCheckboxChange}
              />
            </Form.Group>
            {signupError && <p className="mt-1 text-danger">{signupError}</p>}

            <Button
              variant="border border-light"
              className="w-100 register-button mt-3"
              type="submit"
            >
              Sign Up
            </Button>

            <div>
              <h6 className="my-4 text-dark text-center">
                Have an Account?{" "}
                <Link to="/login" className="text-decoration-none">
                  Login
                </Link>
              </h6>
            </div>
          </form>
        </div>
      </Container>
    </div>

  );
};

export default RegisterForm;
