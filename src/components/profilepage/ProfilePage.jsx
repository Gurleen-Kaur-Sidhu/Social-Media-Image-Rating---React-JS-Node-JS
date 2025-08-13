import React, { useState, useEffect } from "react";
import { Col, Container, Row, Navbar, Card, Button } from "react-bootstrap";
import { AiTwotoneEdit } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { IoChevronBackSharp } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import axios from "axios";
import "./ProfilePage.css";
import { IoIosLogOut } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";

const ProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [profileImage, setProfileImage] = useState("/images/user_image.png");
  const [userPosts, setUserPosts] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [userRatings, setUserRatings] = useState({ totalRatings: 0, totalViewers: 0 });
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      console.error("No token found. User is not authenticated.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

      
        const userResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = userResponse.data.user;
        if (user) {
          setUserData({
            username: user.username || "",
            email: user.email || "",
            bio: user.bio || "",
            profileimage: user.profileimage || "",
            id: user.id,
          });

          if (user.profileimage) {
            setProfileImage(user.profileimage);
          }
        }

        const postResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}image/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserPosts(postResponse.data || []);

        // Fetch average rating
        const ratingResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}profileavg/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAvgRating(ratingResponse.data.avg_rating);

      
        const ratingsResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}userratings/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserRatings({
          totalRatings: ratingsResponse.data[0]?.totalRatings || 0, 
          totalViewers: ratingsResponse.data[0]?.usersRated || 0, 
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserData();
  }, [token]);

  const handleEditClick = () => {
    navigate(`/edit-profile/${userData.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}image/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== imageId)
      );

      console.log("Image and ratings deleted successfully:", response.data);
    } catch (error) {
      console.error("Error deleting image and ratings:", error);
    }
  };

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
              <h4 className="text-center m-0">Profile</h4>
            </div>
            <div className="d-flex justify-content-end logout-button">
              <IoIosLogOut onClick={handleLogout} className="logout-icon" />
            </div>
          </div>
        </Container>
      </Navbar>

      <Container className="profilepage-container">
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
                    src={profileImage}
                    alt="User"
                  />
                  <div
                    className="edit-icon-container"
                    onClick={handleEditClick}
                  >
                    <AiTwotoneEdit className="edit-icon" />
                  </div>
                </div>
              </div>
              <h2 className="p-1 mt-2 mb-0">
                {userData.username || "Loading..."}
              </h2>
              <p>{userData.bio || " "}</p>
            </Col>
          </Row>
        </div>

        <Row className="d-flex column-gap-4 align-items-center justify-content-between">
          <Col className="mb-3 ms-5 average-rating d-flex justify-content-center">
            <h5 className="text-center m-0">
              Rating: {avgRating !== null ? avgRating : "0"}
            </h5>
          </Col>

          <Col className="mb-3 me-5 average-rating d-flex justify-content-center">
            <h5 className="text-center m-0">
              Viewers: {userRatings.totalViewers}
            </h5>
          </Col>
        </Row>

        <div className="p-2 bg-white">
          <Row>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Col
                  lg={12}
                  md={12}
                  sm={12}
                  className="column-imagediv"
                  key={post.id}
                >
                  <Card className="wrapper-div p-4 mb-3 shadow-sm">
                    <Row className="p-0 d-flex justify-content-between align-items-center">
                      <Col
                        lg={10}
                        className="p-0 pb-3 d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex ">
                          <div>
                            <img
                              className="user-post-profile"
                              src={profileImage}
                              alt="User"
                            />
                          </div>
                          <h6 className="p-1 mb-0 ms-2">
                            {userData.username || "User"}
                          </h6>
                        </div>

                        <div className="p-0 delete-button">
                          <MdDeleteOutline
                            onClick={() => handleDeleteImage(post.id)}
                            className="delete-icon"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row className="p-0 justify-content-center">
                      <Col lg={12} className="p-0">
                        <div className="image-div">
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="img-fluid"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row className="p-0">
                      <Col
                        lg={12}
                        className="p-0 py-2 d-flex align-items-center pb-2"
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
      </Container>
    </>
  );
};

export default ProfilePage;
