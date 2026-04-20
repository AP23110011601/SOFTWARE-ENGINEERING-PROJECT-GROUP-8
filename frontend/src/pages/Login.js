import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await  fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login Successful ");
        
        // Redirect based on user role
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.message || "Login failed ");
      }
    } catch (err) {
      alert("Server error ");
    }
  };

  // 
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
      background: "#ffffff",
      padding: "30px",
      borderRadius: "15px",
      width: "100%",
      maxWidth: "350px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
    },
    title: {
      textAlign: "center",
      color: "#2e7d32",
      marginBottom: "20px"
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none"
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "#2e7d32",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer",
      marginBottom: "10px"
    },
    signupText: {
      textAlign: "center",
      fontSize: "14px"
    },
    linkGreen: {
      color: "#2e7d32",
      fontWeight: "bold",
      cursor: "pointer"
    },
    forgot: {
      textAlign: "center",
      marginTop: "10px",
      color: "red",
      cursor: "pointer",
      fontSize: "14px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h2 style={styles.title}>🌱 Login</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login 🚀
        </button>

        <p style={styles.signupText}>
          Don’t have account?{" "}
          <span
            style={styles.linkGreen}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>

        <p
          style={styles.forgot}
          onClick={() => navigate("/forgot")}
        >
          Forgot Password?
        </p>

      </div>
    </div>
  );
};

export default Login;
