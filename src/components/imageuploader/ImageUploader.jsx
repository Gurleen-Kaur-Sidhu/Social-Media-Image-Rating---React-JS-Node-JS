import React, { useState, useEffect } from "react";
import { Col, Container, Row, Navbar } from "react-bootstrap";
import { BiImageAdd } from "react-icons/bi";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import Textarea from "@mui/joy/Textarea";
import { useNavigate } from "react-router-dom";
import { IoChevronBackSharp } from "react-icons/io5";
import "./ImageUploader.css";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handlePostClick = async () => {
    const token = localStorage.getItem("authToken");
    const userId = "123";

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("userid", userId);
    formData.append("caption", caption);

    try {
      const response = await fetch( `${import.meta.env.VITE_APP_API_URL}image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error uploading image:", data);
        alert("Error uploading image");
      } else {
        console.log("Image uploaded successfully:", data);
        alert("Image uploaded successfully!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }

      const userId = "123";

      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setLoading(false);
        } else {
          console.error("Error fetching user data:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Navbar
        className="imageuploader-navbar"
        expand="lg"
        id="navbar-imageuploader"
      >
        <Container className="p-0">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button
              variant="link"
              className="px-0 back-button"
              onClick={() => navigate("/home")}
            >
              <IoChevronBackSharp />
            </Button>
            <div className="d-flex justify-content-center w-100">
              <h4 className="text-center m-0">Create Post</h4>
            </div>
          </div>
        </Container>
      </Navbar>

      <Container className="imageUploader-container">
        <div className="p-2 bg-white">
          <Row className="p-0">
            <Col
              lg={12}
              className="p-0 d-flex align-items-center pb-2 column-gap-2"
            >
              <div className="user-post-profile-container ms-1">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <img
                    className="imageUploader-profile-photo"
                    src={
                      user?.profileimage ||
                     "/images/user_image.png"
                    }
                    alt="User"
                  />
                )}
              </div>

              <h6 className="p-1 mb-0">{user?.username || "Loading..."}</h6>
            </Col>
          </Row>
        </div>

        <div className="mb-3 caption-form">
          <FormControl>
            <Textarea
              placeholder="Type something here…"
              minRows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              sx={[{ minWidth: 300 }]}
            />
          </FormControl>
        </div>

        <Row className="p-0 justify-content-center">
          <Col lg={12}>
            <div className="post-upload-card p-3 border">
              <div className="d-flex align-items-center justify-content-between">
                <div className="post-input-section">
                  <h3 className="mb-0">Add your post</h3>
                </div>
                <div className="gallery-section d-flex align-items-center">
                  <div
                    className="gallery-btn"
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    <BiImageAdd />
                  </div>
                  <input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    className="file-input d-none"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {selectedImage && (
                <div className="original-image-container mt-3">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Uploaded"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              )}
            </div>
          </Col>
        </Row>

        <Row>
          <div className="post-button-container">
            <Button variant="contained" fullWidth onClick={handlePostClick}>
              Post
            </Button>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default ImageUploader;
