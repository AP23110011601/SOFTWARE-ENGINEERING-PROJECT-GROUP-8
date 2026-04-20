import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    state: "",
    district: "",
    cropType: "",
    soilType: "",
    landSize: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Signup Successful! Please login.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server error. Please try again.");
    }
  };

  // 🎨 INLINE STYLES
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #e6f4ea, #d4edda)",
      fontFamily: "Arial, sans-serif"
    },
    container: {
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      width: "100%",
      maxWidth: "600px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
    },
    title: {
      textAlign: "center",
      color: "#2e7d32",
      marginBottom: "20px"
    },
    form: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px"
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none"
    },
    fullWidth: {
      gridColumn: "span 2"
    },
    button: {
      gridColumn: "span 2",
      padding: "12px",
      background: "#2e7d32",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer"
    },
    loginText: {
      textAlign: "center",
      marginTop: "15px"
    },
    link: {
      color: "red",
      cursor: "pointer",
      fontWeight: "bold"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h2 style={styles.title}>Create Your Account 🌱</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={styles.input} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
          <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} style={styles.input} />
          <input type="text" name="state" placeholder="State" onChange={handleChange} style={styles.input} />
          <input type="text" name="district" placeholder="District" onChange={handleChange} style={styles.input} />

          <select name="cropType" onChange={handleChange} style={styles.input}>
            <option value="">Select Crop</option>
            <option>Rice</option>
            <option>Wheat</option>
            <option>Cotton</option>
            <option>Maize</option>
          </select>

          <select name="soilType" onChange={handleChange} style={styles.input}>
            <option value="">Select Soil</option>
            <option>Clay</option>
            <option>Sandy</option>
            <option>Loamy</option>
          </select>

          <input
            type="number"
            name="landSize"
            placeholder="Land Size (Acres)"
            onChange={handleChange}
            style={{ ...styles.input, ...styles.fullWidth }}
          />

          <button type="submit" style={styles.button}>
            Sign Up 🚀
          </button>

        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;