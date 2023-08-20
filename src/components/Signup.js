import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/Circle-icons-cloud.svg.png";

const Signup = (props) => {
  let navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = credentials;

    const response = await fetch("http://localhost:5000/api/auth/createuser", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const json = await response.json();
    // console.log(json);
    if (json.success) {
      localStorage.setItem("authToken", json.authToken);

      navigate("/");

      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert("Invalid Credentials", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="formSU">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center">
          <img id="img1" src={img} alt="" />
          <h3 className="text-white">I-Memory</h3>
        </div>
        <h4 className="text-white mt-4 text-center formMargin">Sign-Up</h4>
        <div className="mb-3 mt-4 ">
          <label htmlFor="name" className="form-label text-white">
            Name
          </label>
          <input
            type="name"
            className="form-control"
            id="name"
            name="name"
            onChange={onChange}
            aria-describedby="emailHelp"
          />
        </div>
        <div className="mb-3 mt-4">
          <label htmlFor="email" className="form-label text-white">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
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
            onChange={onChange}
            minLength={5}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label text-white">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="cpassword"
            name="cpassword"
            onChange={onChange}
            minLength={5}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-1 my-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;
