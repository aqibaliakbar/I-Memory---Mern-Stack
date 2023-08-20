import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";

const Login = (props) => {
  let navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json();

    if (json.success) {
      localStorage.setItem("authToken", json.authToken);

      props.showAlert("Logged in Successfully", "success");
      navigate("/");
    } else {
      props.showAlert("Invalid Details", "Error");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  return (
    <>
      <div className="formLI">
        <div className="d-flex mt-4 justify-content-center">
          <img id="img1" src={img} alt="" />
          <h3 className="text-white ">I-Memory</h3>
        </div>
        <h4 className="text-white mt-4 text-center formMargin">
          Log in to your account
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white mt-4">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text text-white">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-white">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-1 my-2">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
