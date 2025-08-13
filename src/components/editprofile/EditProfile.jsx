import React, { useState, useEffect } from "react";
import { Col, Container, Row, Navbar, Button, Form } from "react-bootstrap";
import { IoChevronBackSharp } from "react-icons/io5";
import { CiCamera } from "react-icons/ci";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { TiUserDelete } from "react-icons/ti";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [email, setEmail] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = response.data.user;
        if (user) {
          setName(user.username || "");
          setBio(user.bio || "");
          setEmail(user.email || "");
          setImage(user.profileimage || null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", name);
      formData.append("bio", bio);

      if (image && typeof image !== "string") {
        formData.append("profileimage", image);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Profile updated successfully:", response.data);
      navigate("/profilepage");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const fileInputRef = React.createRef();
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleDeleteImage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      const response = await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}profileimg/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile image deleted successfully:", response.data);
      setImage(null); 
      setImagePreview(null); 
    } catch (error) {
      console.error("Error deleting profile image:", error);
    }
  };

  return (
    <>
      <Navbar className="editprofile-navbar" expand="lg" id="navbar-imageuploader">
        <Container className="p-0">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button
              variant="link"
              className="px-0 back-button"
              onClick={() => navigate("/profilepage")}
            >
              <IoChevronBackSharp />
            </Button>
            <div className="d-flex justify-content-center w-100">
              <h4 className="text-center m-0">Edit Profile</h4>
            </div>
          </div>
        </Container>
      </Navbar>

      <Container className="editprofile-container p-3">
        <div className="p-2 bg-white">
          <Row className="p-0">
            <Col
              lg={12}
              className="p-0 text-center justify-content-center pb-2 row-gap-4"
            >
              <div className="user-profileimage ms-1">
                <div className="profile-image-container">
                  <img
                    className="profilepage-profile-photo"
                    src={
                      imagePreview ||
                      (image ? `/${image}` : "/images/user_image.png")
                    }
                    alt="User"
                  />
                  <div
                    className="edit-icon-container"
                    onClick={handleCameraClick}
                  >
                    <CiCamera className="edit-icon" />
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-center mt-2">
            <Button className="delete-profile-button d-flex align-items-center justify-content-center p-2" onClick={handleDeleteImage}>
            <TiUserDelete />
            <p className="mb-0">Remove Image</p>
            </Button>
          </div>
        </div>

        <p>Please fill in your profile details</p>

        <Form className="mb-3">
          <Form.Group controlId="formName">
          <Form.Label>Name :</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
        </Form>

        <Form className="mb-3">
          <Form.Group controlId="formEmail">
          <Form.Label>Email :</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
        </Form>

        <Form className="mb-3">
          <Form.Group controlId="formBio">
          <Form.Label>Bio :</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Form.Group>
        </Form>

        <Row>
          <div className="post-button-container">
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default EditProfile;

