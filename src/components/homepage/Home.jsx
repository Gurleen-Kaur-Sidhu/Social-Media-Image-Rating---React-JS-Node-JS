import React, { useState, useEffect } from "react";
import { Card, Col, Container, Row, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { FaRegPlusSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LuSquareUserRound } from "react-icons/lu";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating, onChange }) => {
  const handleClick = (newRating) => {
    onChange(newRating);
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "filled" : ""}`}
          onClick={() => handleClick(star)}
        >
         <FaStar />
        </span>
      ))}
    </div>
  );
};

const Home = () => {
  const [users, setUsers] = useState([]);
  const [userImages, setUserImages] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");
  const [averageRatings, setAverageRatings] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!token) {
          console.log("No token found");
          setLoading(false);
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userIdFromToken = decodedToken.id;
        setUserId(userIdFromToken);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching userId from token:", error);
        setLoading(false);
      }
    };

    fetchUserId();
  }, [token]);
  const decodedToken = JSON.parse(atob(token.split(".")[1]));
  const userIdFromToken = decodedToken.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}users`);
        setUsers(usersResponse.data.Users);

        const allImages = [];
        const ratingsData = {};
        const avgRatingsData = {};

        await Promise.all(
          usersResponse.data.Users.map(async (user) => {
            try {
              const imagesResponse = await axios.get(
                `${import.meta.env.VITE_APP_API_URL}image/${user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              console.log(`Images for user ${user.id}:`, imagesResponse.data);

              if (imagesResponse.data && imagesResponse.data.length > 0) {
                imagesResponse.data.forEach((image) => {
                  allImages.push({
                    ...image,
                    userId: user.id,
                    username: user.username,
                    profileImage: user.profileimage || "/images/user_image.png",
                  });
                });
              }

              await Promise.all(
                imagesResponse.data.map(async (image) => {
                  try {
                    const ratingResponse = await axios.get(
                     `${import.meta.env.VITE_APP_API_URL}rating/${userIdFromToken}/${image.id}` ,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (ratingResponse.data && ratingResponse.data.Data) {
                      ratingsData[image.id] =
                        ratingResponse.data.Data.rating || 0;
                    } else {
                      ratingsData[image.id] = 0;
                    }

                    const avgRatingResponse = await axios.get(
                     `${import.meta.env.VITE_APP_API_URL}avgrating/${image.id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    avgRatingsData[image.id] =
                      avgRatingResponse.data["Average Rating"] || 0;
                  } catch (error) {
                    console.log(
                      `Error fetching ratings for image ${image.id}:`,
                      error
                    );
                  }
                })
              );
            } catch (error) {
              console.log(`Error fetching images for user ${user.id}:`, error);
            }
          })
        );

        allImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUserImages(allImages);
        setUserRatings(ratingsData);
        setAverageRatings(avgRatingsData);
      } catch (error) {
        console.log("Error fetching users or images:", error);
      }
    };

    fetchData();
  }, [token]);

  const usersWithPosts = users.filter(
    (user) => userImages[user.id]?.length > 0
  );

  const handleRatingChange = async (userId, imageId, newRating) => {
    if (!userId) {
      console.log("User ID is not defined yet.");
      return;
    }

    try {
      console.log(
        `User ${userIdFromToken} rated image ${imageId} with a rating of ${newRating}`
      );

      await axios.put(
        `${import.meta.env.VITE_APP_API_URL}rating`,
        {
          userid: userIdFromToken,
          image_id: imageId,
          rating: newRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ratingResponse = await axios.get(
      `${import.meta.env.VITE_APP_API_URL}rating/${userIdFromToken}/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newRatingValue = ratingResponse.data.Data?.rating || 0;

      setUserRatings((prevRatings) => ({
        ...prevRatings,
        [imageId]: newRatingValue,
      }));
    } catch (error) {
      console.log("Error submitting rating:", error);
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/otherprofile/${userId}`);
  };

  return (
    <>
      <Navbar className="home-navbar" expand="lg" id="navbar-home">
        <Container className="px-0">
          <Navbar.Brand>
            <Link to="/" className="text-decoration-none">
              <h4>SnapShare</h4>
            </Link>
          </Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center column-gap-3">
            <Link
              to="/imageuploader"
              className="text-decoration-none create-post-icon"
            >
              <FaRegPlusSquare />
            </Link>

            <Link to="/profilepage" className="text-decoration-none">
              <LuSquareUserRound />
            </Link>
          </Nav>
        </Container>
      </Navbar>

      {loading ? (
        <Container className="home-container d-flex justify-content-center align-items-center">
          <p>Loading...</p>
        </Container>
      ) : userImages.length > 0 ? (
        <Container className="home-container d-flex justify-content-center align-items-center">
          <div className="p-2 bg-white w-100">
            <Row className="p-0">
              {userImages.map((image) => (
                <Col
                  lg={12}
                  md={12}
                  sm={12}
                  key={image.id}
                  className="column-imagediv"
                >
                  <Card className="wrapper-div p-4 mb-3 shadow-sm">
                    <Row className="p-0" lg={5}>
                      <Col
                        lg={12}
                        className="p-0 d-flex align-items-center pb-3 name-image-box"
                        onClick={() => handleProfileClick(image.userId)}
                      >
                        <div>
                          <img
                            className="user-post-profile"
                            src={image.profileImage}
                            alt="User"
                          />
                        </div>
                        <h6
                          className="p-1 mb-0 ms-2"
                          onClick={() => handleProfileClick(image.userId)}
                        >
                          {image.username}
                        </h6>
                      </Col>
                    </Row>

                    <Row className="p-0 justify-content-center">
                      <Col lg={12} className="p-0">
                        <div className="image-div">
                          
                          <div className="image-container">
                            <img
                              src={image.image}
                              alt={image.caption || "User Post"}
                              className="img-fluid"
                            />
                          </div>
                          <p className="image-caption my-2">{image.caption || ""}</p>
                          {/* Star Rating */}
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <div>
                              <StarRating
                                rating={userRatings[image.id] || 0}
                                onChange={(newRating) =>
                                  handleRatingChange(
                                    image.userId,
                                    image.id,
                                    newRating
                                  )
                                }
                              />
                            </div>
                            <p className="mb-0 average-para">
                              {isNaN(averageRatings[image.id]) ||
                              averageRatings[image.id] === undefined
                                ? "0"
                                : averageRatings[image.id]}
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      ) : (
        <Container className="home-container d-flex justify-content-center align-items-center">
          <p>No posts available for any user.</p>
        </Container>
      )}
    </>
  );
};

export default Home;
