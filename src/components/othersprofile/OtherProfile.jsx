import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Container, Row, Navbar, Card, Button } from "react-bootstrap";
import { IoChevronBackSharp } from "react-icons/io5";
import axios from "axios";
import "./OtherProfile.css";

const OtherProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const token = localStorage.getItem("authToken");

  const handleBackButton = () => {
    navigate("/home");
  };

  useEffect(() => {
    if (!userId) {
      console.error("No userId found in URL");
      navigate("/home");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}user/${userId}`
        );
        setUserData(response.data.user);

        const postsResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}otherpf/${userId}`
        );
        setUserPosts(postsResponse.data || []);

        const ratingResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}profileavg/${userId}`
        );
        console.log("Average Rating Response:", ratingResponse.data);
        setAvgRating(ratingResponse.data.avg_rating);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <div>
      <Navbar
        className="otherprofile-navbar"
        expand="lg"
        id="navbar-otherprofile"
      >
        <Container className="p-0">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button
              variant="link"
              className="px-0 back-button"
              onClick={handleBackButton}
            >
              <IoChevronBackSharp />
            </Button>
            <div className="d-flex justify-content-center w-100">
              <h4 className="text-center m-0">User Profile</h4>
            </div>
          </div>
        </Container>
      </Navbar>

      <Container className="otherprofile-container">
        <div className="bg-white">
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
                      userData.profileimage && userData.profileimage !== ""
                        ? `/${userData.profileimage}`
                        : "/images/user_image.png"
                    }
                    alt={userData.username || "User"}
                  />
                </div>
              </div>
              <h2 className="p-1 mt-2 mb-0">{userData.username || ""}</h2>
              <p>{userData.bio || ""}</p>
            </Col>
          </Row>

          <Row>
            <div className="d-flex justify-content-center w-100 mb-3">
              <h4 className="text-center m-0 otherprofile-averagebox">
                Rating:{" "}
                {avgRating !== null ? avgRating : "No ratings yet"}
              </h4>
            </div>
          </Row>

          <div className="p-2 bg-white">
            <Row>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <Col lg={12} key={post.id} className="p-0">
                    <Card className="wrapper-div p-4 mb-3 shadow-sm">
                      <Row className="p-0 d-flex justify-content-between align-items-center">
                        <Col lg={10} className="p-0 pb-3 d-flex align-items-center">
                          <div>
                            <img
                              className="user-post-profile"
                              src={
                                userData.profileimage &&
                                userData.profileimage !== ""
                                  ? `/${userData.profileimage}`
                                  : "/images/user_image.png"
                              }
                              alt={userData.username || "User"}
                            />
                          </div>
                          <h6 className="p-1 mb-0 ms-2">{userData.username}</h6>
                        </Col>
                      </Row>

                      
                      <Row className="p-0 justify-content-center">
                        <Col lg={12} className="p-0">
                          <div className="image-div">
                            <img
                              src={`/${post.image}`}
                              alt={post.caption}
                              className="img-fluid"
                            />
                          </div>
                        </Col>
                      </Row>

                      <Row className="p-0">
                        <Col
                          lg={12}
                          className="p-0 d-flex align-items-center py-2"
                        >
                          <p className="image-caption mb-0">{post.caption || ""}</p>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))
              ) : (
                <p className="text-center w-100">No posts available</p>
              )}
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OtherProfile;
