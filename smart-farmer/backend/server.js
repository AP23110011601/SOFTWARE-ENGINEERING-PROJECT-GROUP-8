const express = require("express");
const cors    = require("cors");
const db      = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ─── CREATE TABLE ──────────────────────────────────────────────────────────
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15)  NOT NULL,
    password        VARCHAR(255) NOT NULL,
    farm_name       VARCHAR(100),
    farm_type       VARCHAR(50),
    land_size       VARCHAR(30),
    state           VARCHAR(50),
    district        VARCHAR(50),
    village         VARCHAR(50),
    irrigation_type VARCHAR(50),
    soil_type       VARCHAR(50),
    notifications   TINYINT(1) DEFAULT 1,
    language        VARCHAR(5)  DEFAULT 'en',
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
  )
`, err => { if(err) console.log("Table error:",err); else console.log("Users table ready ✅"); });

// ─── SIGNUP ────────────────────────────────────────────────────────────────
app.post("/api/signup", (req, res) => {
  const { fullName,email,phone,password,farmName,farmType,landSize,
          state,district,village,irrigationType,soilType,notifications,lang } = req.body;

  db.query("SELECT id FROM users WHERE email=?", [email], (err,rows) => {
    if (err)          return res.status(500).json({ success:false, message:"Server error" });
    if (rows.length)  return res.status(400).json({ success:false, message:"Email already registered" });

    db.query(
      `INSERT INTO users (full_name,email,phone,password,farm_name,farm_type,land_size,
       state,district,village,irrigation_type,soil_type,notifications,language)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [fullName,email,phone,password,farmName,farmType,landSize,
       state,district,village,irrigationType,soilType,notifications?1:0,lang||"en"],
      (err, result) => {
        if (err) return res.status(500).json({ success:false, message:"Failed to save user" });
        return res.status(201).json({ success:true, message:"Account created", userId:result.insertId });
      }
    );
  });
});

// ─── LOGIN — returns full profile incl. farmType, landSize, soilType ───────
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email||!password)
    return res.status(400).json({ success:false, message:"Email and password required" });

  db.query("SELECT * FROM users WHERE email=?", [email], (err,rows) => {
    if (err)         return res.status(500).json({ success:false, message:"Server error" });
    if (!rows.length) return res.status(401).json({ success:false, message:"No account found" });

    const u = rows[0];
    if (u.password !== password)
      return res.status(401).json({ success:false, message:"Incorrect password" });

    return res.status(200).json({
      success: true,
      user: {
        id:             u.id,
        fullName:       u.full_name,
        email:          u.email,
        farmName:       u.farm_name,
        farmType:       u.farm_type,        // ← crop selected at signup
        landSize:       u.land_size,        // ← for water calculation
        state:          u.state,
        district:       u.district,
        irrigationType: u.irrigation_type,
        soilType:       u.soil_type,        // ← for disease context
        language:       u.language,
      }
    });
  });
});

app.listen(5000, () => console.log("Server running on port 5000 🚀"));