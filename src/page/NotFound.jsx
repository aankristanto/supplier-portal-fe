import { useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate,  } from "react-router-dom";
import imgNotFound from "../assets/404-NotFound.png";

const NotFound = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const lastValidURL = sessionStorage.getItem("lastValidURL");
    setTimeout(() => {
      if (lastValidURL) {
        navigate(lastValidURL);
      } else {
        navigate("/");
      }
    }, 5000);
  }, [navigate]);

  return (
    <div style={{height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Card className="shadow border-0 rounded mt-5" style={{width: '500px'}}>
                <Card.Body>
                  <div className="mx-auto d-block text-center">
                    <img
                      className="img-fluid"
                      style={{ width: "18rem" }}
                      src={imgNotFound}
                      alt="Not Found"
                    />
                    <div className="mt-3">
                      <h2 className="fs-3">Upss!! Page Not Found</h2>
                    </div>
                    <div className="my-4 d-flex justify-content-center">
                        <Button variant="primary">Back to home</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
    </div>
  );
};

export default NotFound;
