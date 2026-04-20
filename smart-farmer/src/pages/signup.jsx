import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/Languagecontext";

const floatingItems = [
  { emoji: "🌾", size: 40, x: 5,  y: 15, delay: 0,   duration: 6   },
  { emoji: "🌿", size: 30, x: 90, y: 20, delay: 1,   duration: 7   },
  { emoji: "🌱", size: 28, x: 8,  y: 70, delay: 2,   duration: 5.5 },
  { emoji: "🍃", size: 26, x: 88, y: 65, delay: 0.5, duration: 8   },
  { emoji: "☀️", size: 36, x: 50, y: 5,  delay: 1.5, duration: 6   },
];

const FARM_TYPES  = ["Rice / Paddy","Wheat","Cotton","Vegetables","Fruits","Sugarcane","Maize / Corn","Pulses","Other"];
const STATES      = ["Andhra Pradesh","Telangana","Karnataka","Tamil Nadu","Maharashtra","Punjab","Haryana","Uttar Pradesh","Gujarat","Rajasthan","Madhya Pradesh","Other"];
const LAND_SIZES  = ["< 1 Acre","1–5 Acres","5–10 Acres","10–25 Acres","25–50 Acres","50+ Acres"];

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const LANG_OPTIONS = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "te", label: "తెలుగు",   flag: "🇮🇳" },
  { code: "hi", label: "हिंदी",    flag: "🇮🇳" },
];

/* ─── shared bg / card wrapper ─── */
function BG({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(4deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes orb{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.08) translate(20px,-15px)}}
        @keyframes successPop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes checkDraw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
        @keyframes langPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .float-item{animation:floatY var(--dur,6s) ease-in-out infinite;animation-delay:var(--delay,0s);}
        .fade-card{animation:fadeUp 0.45s ease forwards;}
        .step-slide{animation:slideIn 0.35s ease forwards;}

        .field-input{width:100%;background:rgba(255,255,255,0.8);border:1.5px solid rgba(134,239,172,0.6);border-radius:12px;padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:#14532d;outline:none;transition:all 0.2s;}
        .field-input:focus{border-color:#22c55e;background:#fff;box-shadow:0 0 0 3px rgba(34,197,94,0.12);}
        .field-input::placeholder{color:#a7c4a7;}
        .field-input.err{border-color:#f87171;background:#fff5f5;}
        select.field-input{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2322c55e' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;}

        .btn-primary{width:100%;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:14px;border-radius:14px;cursor:pointer;transition:all 0.28s;box-shadow:0 6px 24px rgba(34,197,94,0.35);margin-top:8px;}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(34,197,94,0.4);}
        .btn-primary:disabled{opacity:0.7;cursor:not-allowed;transform:none;}
        .btn-back{background:transparent;border:1.5px solid rgba(34,197,94,0.3);color:#166534;font-family:'DM Sans',sans-serif;font-weight:500;font-size:14px;padding:12px;border-radius:14px;cursor:pointer;transition:all 0.2s;flex:1;}
        .btn-back:hover{background:rgba(34,197,94,0.06);border-color:#22c55e;}

        .role-btn{border:2px solid rgba(134,239,172,0.5);border-radius:20px;background:rgba(255,255,255,0.7);padding:28px 20px;cursor:pointer;transition:all 0.25s;text-align:center;flex:1;}
        .role-btn:hover{border-color:#22c55e;background:rgba(255,255,255,0.95);transform:translateY(-4px);box-shadow:0 16px 40px rgba(34,197,94,0.2);}

        .lang-pill{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:14px;border:2px solid transparent;cursor:pointer;transition:all 0.22s;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;background:rgba(255,255,255,0.7);}
        .lang-pill:hover{border-color:#86efac;background:rgba(255,255,255,0.95);}
        .lang-pill.active{border-color:#22c55e;background:linear-gradient(135deg,rgba(240,253,244,0.95),rgba(220,252,231,0.95));color:#14532d;font-weight:700;animation:langPulse 1.2s ease 1;}

        .step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all 0.3s;}
        .step-dot.done{background:#22c55e;color:#fff;}
        .step-dot.active{background:#14532d;color:#fff;box-shadow:0 4px 14px rgba(20,83,45,0.3);}
        .step-dot.pending{background:rgba(255,255,255,0.6);color:#86efac;border:1.5px solid rgba(134,239,172,0.5);}

        .toggle-check{width:20px;height:20px;border-radius:6px;border:2px solid rgba(34,197,94,0.5);background:rgba(255,255,255,0.8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
        .toggle-check.checked{background:#22c55e;border-color:#22c55e;}

        .success-icon{animation:successPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards;}
        .check-path{stroke-dasharray:100;animation:checkDraw 0.6s ease 0.3s forwards;stroke-dashoffset:100;}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;margin-right:8px;vertical-align:middle;}
      `}</style>

      {/* bg orbs */}
      <div style={{ position:"absolute",top:"10%",left:"5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(134,239,172,0.4) 0%,transparent 70%)",animation:"orb 12s ease-in-out infinite",pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:"5%",right:"5%",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.3) 0%,transparent 70%)",animation:"orb 16s ease-in-out infinite reverse",pointerEvents:"none" }} />
      {floatingItems.map((item,i) => (
        <div key={i} className="float-item" style={{ position:"absolute",left:`${item.x}%`,top:`${item.y}%`,fontSize:item.size,"--dur":`${item.duration}s`,"--delay":`${item.delay}s`,opacity:0.55,pointerEvents:"none",userSelect:"none" }}>{item.emoji}</div>
      ))}
      {children}
    </div>
  );
}

function Card({ children, maxWidth=520, style={} }) {
  return (
    <div className="fade-card" style={{ width:"100%", maxWidth, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(20px)", border:"1px solid rgba(134,239,172,0.5)", borderRadius:28, padding:"40px 44px", boxShadow:"0 24px 80px rgba(34,197,94,0.15),0 2px 0 rgba(255,255,255,0.8) inset", ...style }}>
      {children}
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={style}>
      <label style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#4b8b4b",letterSpacing:"0.5px",textTransform:"uppercase",display:"block",marginBottom:6 }}>{label}</label>
      {children}
      {error && <div style={{ fontFamily:"'DM Sans'",fontSize:11,color:"#ef4444",marginTop:4 }}>⚠ {error}</div>}
    </div>
  );
}

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
export default function Signup() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  const [role, setRole]           = useState(null);
  const [step, setStep]           = useState(0);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);   // ← NEW: loading state
  const [apiError, setApiError]   = useState("");      // ← NEW: API error message

  // admin
  const [adminForm, setAdminForm]     = useState({ username:"", password:"" });
  const [adminError, setAdminError]   = useState("");
  const [adminShowPass, setAdminShowPass] = useState(false);

  const [form, setForm] = useState({
    fullName:"", email:"", phone:"", password:"", confirmPassword:"",
    farmName:"", farmType:"", landSize:"", state:"", district:"", village:"",
    irrigationType:"", soilType:"", notifications:true, agreeTerms:false,
  });

  const update = (field, val) => {
    setForm(f => ({ ...f, [field]:val }));
    setErrors(e => ({ ...e, [field]:"" }));
    setApiError("");
  };

  /* validations */
  const v1 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t("nameRequired");
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t("validEmail");
    if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = t("validPhone");
    if (form.password.length < 8) e.password = t("minPassword");
    if (form.password !== form.confirmPassword) e.confirmPassword = t("passwordMatch");
    setErrors(e); return !Object.keys(e).length;
  };
  const v2 = () => {
    const e = {};
    if (!form.farmName.trim()) e.farmName = t("farmRequired");
    if (!form.farmType) e.farmType = t("selectCropError");
    if (!form.landSize) e.landSize = t("selectLandError");
    if (!form.state) e.state = t("selectStateError");
    if (!form.district.trim()) e.district = t("districtRequired");
    setErrors(e); return !Object.keys(e).length;
  };
  const v3 = () => {
    const e = {};
    if (!form.agreeTerms) e.agreeTerms = t("agreeTerms");
    setErrors(e); return !Object.keys(e).length;
  };

  // ─── SUBMIT TO DATABASE ───────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!v3()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:       form.fullName,
          email:          form.email,
          phone:          form.phone,
          password:       form.password,
          farmName:       form.farmName,
          farmType:       form.farmType,
          landSize:       form.landSize,
          state:          form.state,
          district:       form.district,
          village:        form.village,
          irrigationType: form.irrigationType,
          soilType:       form.soilType,
          notifications:  form.notifications,
          lang:           lang,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(4); // ✅ go to success screen
      } else {
        setApiError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setApiError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && v1()) setStep(2);
    else if (step === 2 && v2()) setStep(3);
    else if (step === 3) handleSignup(); // ← calls API instead of just setStep(4)
  };

  const handleAdminLogin = () => {
    setAdminError("");
    if (adminForm.username===ADMIN_USERNAME && adminForm.password===ADMIN_PASSWORD) navigate("/admin");
    else setAdminError(t("invalidCreds"));
  };

  const getStrength = pw => {
    let s=0;
    if(pw.length>=8)s++; if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++;
    return s;
  };
  const sColor = s => s<=1?"#ef4444":s===2?"#f97316":s===3?"#eab308":"#22c55e";
  const sLabel = s => [t("weak"),t("weak"),t("fair"),t("good"),t("strong")][s];

  const progressPct = ((step-1)/3)*100;

  const StepBar = () => (
    <>
      <div style={{ display:"flex",alignItems:"center",marginBottom:28 }}>
        {[{n:1,l:t("personal")},{n:2,l:t("farmInfo")},{n:3,l:t("preferences")}].map((s,i)=>(
          <div key={s.n} style={{ display:"flex",alignItems:"center",flex:i<2?"1":"0" }}>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
              <div className={`step-dot ${step>s.n?"done":step===s.n?"active":"pending"}`}>{step>s.n?"✓":s.n}</div>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:step>=s.n?"#14532d":"#a7c4a7",fontWeight:step===s.n?600:400 }}>{s.l}</span>
            </div>
            {i<2&&<div style={{ flex:1,height:2,margin:"0 8px 18px",background:step>s.n?"linear-gradient(90deg,#22c55e,#86efac)":"rgba(134,239,172,0.3)",borderRadius:2,transition:"all 0.4s" }} />}
          </div>
        ))}
      </div>
      <div style={{ height:4,background:"rgba(134,239,172,0.25)",borderRadius:4,marginBottom:24,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${progressPct}%`,background:"linear-gradient(90deg,#22c55e,#4ade80)",borderRadius:4,transition:"width 0.5s" }} />
      </div>
    </>
  );

  return (
    <BG>
      {/* ── ROLE SELECTION ── */}
      {!role && (
        <Card maxWidth={520}>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ fontSize:36,marginBottom:8 }}>🌾</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#14532d",marginBottom:4 }}>{t("welcome")}</h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a",fontWeight:300 }}>{t("selectRole")}</p>
          </div>
          <div style={{ display:"flex",gap:16,marginBottom:28 }}>
            <button className="role-btn" onClick={()=>{setRole("user");setStep(0);}}>
              <div style={{ fontSize:42,marginBottom:10 }}>👨‍🌾</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#14532d",marginBottom:6 }}>{t("farmerUser")}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6aaa6a",fontWeight:300,lineHeight:1.5 }}>{t("farmerDesc")}</div>
            </button>
            <button className="role-btn" onClick={()=>setRole("admin")}>
              <div style={{ fontSize:42,marginBottom:10 }}>🛡️</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#14532d",marginBottom:6 }}>{t("admin")}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6aaa6a",fontWeight:300,lineHeight:1.5 }}>{t("adminDesc")}</div>
            </button>
          </div>
          <p style={{ textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a" }}>
            {t("alreadyAccount")}{" "}<span onClick={()=>navigate("/login")} style={{ color:"#16a34a",fontWeight:600,cursor:"pointer",textDecoration:"underline" }}>{t("logIn")}</span>
          </p>
        </Card>
      )}

      {/* ── ADMIN LOGIN ── */}
      {role==="admin" && (
        <Card maxWidth={440}>
          <button onClick={()=>{setRole(null);setAdminError("");}} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a",marginBottom:20 }}>{t("back")}</button>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <div style={{ fontSize:42,marginBottom:8 }}>🛡️</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#14532d",marginBottom:4 }}>{t("adminLogin")}</h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a",fontWeight:300 }}>{t("adminLoginDesc")}</p>
          </div>
          <div style={{ marginBottom:14 }}>
            <Field label={t("username")}>
              <input className="field-input" placeholder="admin" value={adminForm.username} onChange={e=>{setAdminForm(f=>({...f,username:e.target.value}));setAdminError("");}} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} />
            </Field>
          </div>
          <div style={{ marginBottom:20 }}>
            <Field label={t("password")}>
              <div style={{ position:"relative" }}>
                <input className={`field-input${adminError?" err":""}`} placeholder="••••••••" type={adminShowPass?"text":"password"} value={adminForm.password} onChange={e=>{setAdminForm(f=>({...f,password:e.target.value}));setAdminError("");}} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} style={{ paddingRight:40 }} />
                <button onClick={()=>setAdminShowPass(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,opacity:0.6 }}>{adminShowPass?"🙈":"👁️"}</button>
              </div>
            </Field>
          </div>
          {adminError&&<div style={{ background:"rgba(254,242,242,0.9)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#ef4444" }}>⚠️ {adminError}</div>}
          <button className="btn-primary" onClick={handleAdminLogin}>{t("loginAsAdmin")}</button>
          <div style={{ marginTop:14,padding:"10px 14px",background:"rgba(240,253,244,0.7)",border:"1px solid rgba(134,239,172,0.4)",borderRadius:10,textAlign:"center" }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6aaa6a" }}>{t("defaultCreds")}: <strong style={{ color:"#16a34a" }}>admin</strong> / <strong style={{ color:"#16a34a" }}>admin123</strong></span>
          </div>
        </Card>
      )}

      {/* ── USER FLOW ── */}
      {role==="user" && (
        <>
          {step===0 && (
            <Card maxWidth={500}>
              <button onClick={()=>setRole(null)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a",marginBottom:20 }}>{t("back")}</button>
              <div style={{ textAlign:"center",marginBottom:32 }}>
                <div style={{ fontSize:40,marginBottom:10 }}>🌐</div>
                <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#14532d",marginBottom:6 }}>{t("chooseLang")}</h1>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a",fontWeight:300 }}>{t("chooseLangDesc")}</p>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:32 }}>
                {LANG_OPTIONS.map(opt => (
                  <button key={opt.code} className={`lang-pill${lang===opt.code?" active":""}`} onClick={()=>setLang(opt.code)} style={{ justifyContent:"space-between" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <span style={{ fontSize:28 }}>{opt.flag}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:16,color:"#14532d" }}>{opt.label}</span>
                    </div>
                    {lang===opt.code && <div style={{ width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:700 }}>✓</div>}
                  </button>
                ))}
              </div>
              <button className="btn-primary" onClick={()=>setStep(1)}>{t("continueBtn")} →</button>
            </Card>
          )}

          {step>=1 && (
            <Card maxWidth={step===4?480:560}>
              {step < 4 ? (
                <>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
                    <button onClick={()=>step===1?setStep(0):setStep(s=>s-1)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#6aaa6a" }}>{t("back")}</button>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:20,marginBottom:2 }}>🌾</div>
                      <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#14532d",marginBottom:2 }}>{t("createAccount")}</h1>
                      <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#6aaa6a",fontWeight:300 }}>{t("joinFarmers")}</p>
                    </div>
                    <div style={{ padding:"5px 12px",background:"rgba(240,253,244,0.9)",border:"1px solid rgba(134,239,172,0.5)",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#16a34a",fontWeight:600,cursor:"pointer" }} onClick={()=>setStep(0)}>
                      {LANG_OPTIONS.find(o=>o.code===lang)?.flag} {LANG_OPTIONS.find(o=>o.code===lang)?.label}
                    </div>
                  </div>

                  <StepBar />

                  {/* ─ STEP 1 ─ */}
                  {step===1 && (
                    <div className="step-slide">
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("fullName")} error={errors.fullName}>
                          <input className={`field-input${errors.fullName?" err":""}`} placeholder={t("namePlaceholder")} value={form.fullName} onChange={e=>update("fullName",e.target.value)} />
                        </Field>
                        <Field label={t("mobileNumber")} error={errors.phone}>
                          <input className={`field-input${errors.phone?" err":""}`} placeholder={t("phonePlaceholder")} value={form.phone} onChange={e=>update("phone",e.target.value)} maxLength={10} />
                        </Field>
                      </div>
                      <Field label={t("emailAddress")} error={errors.email} style={{ marginBottom:16 }}>
                        <input className={`field-input${errors.email?" err":""}`} placeholder={t("emailPlaceholder")} type="email" value={form.email} onChange={e=>update("email",e.target.value)} />
                      </Field>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("passwordLabel")} error={errors.password}>
                          <div style={{ position:"relative" }}>
                            <input className={`field-input${errors.password?" err":""}`} placeholder={t("passPlaceholder")} type={showPass?"text":"password"} value={form.password} onChange={e=>update("password",e.target.value)} style={{ paddingRight:40 }} />
                            <button onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,opacity:0.6 }}>{showPass?"🙈":"👁️"}</button>
                          </div>
                        </Field>
                        <Field label={t("confirmPassword")} error={errors.confirmPassword}>
                          <div style={{ position:"relative" }}>
                            <input className={`field-input${errors.confirmPassword?" err":""}`} placeholder={t("confirmPlaceholder")} type={showConfirm?"text":"password"} value={form.confirmPassword} onChange={e=>update("confirmPassword",e.target.value)} style={{ paddingRight:40 }} />
                            <button onClick={()=>setShowConfirm(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,opacity:0.6 }}>{showConfirm?"🙈":"👁️"}</button>
                          </div>
                        </Field>
                      </div>
                      {form.password&&(
                        <div style={{ marginBottom:16 }}>
                          <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                            {[1,2,3,4].map(i=>{const s=getStrength(form.password);return<div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=s?sColor(s):"rgba(134,239,172,0.3)",transition:"all 0.3s" }} />;})}
                          </div>
                          <span style={{ fontFamily:"'DM Sans'",fontSize:11,color:sColor(getStrength(form.password)) }}>{sLabel(getStrength(form.password))}</span>
                        </div>
                      )}
                      <button className="btn-primary" onClick={nextStep}>{t("continueToFarm")}</button>
                      <p style={{ textAlign:"center",fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",marginTop:16 }}>
                        {t("alreadyAccount")}{" "}<span onClick={()=>navigate("/login")} style={{ color:"#16a34a",fontWeight:600,cursor:"pointer",textDecoration:"underline" }}>{t("logIn")}</span>
                      </p>
                    </div>
                  )}

                  {/* ─ STEP 2 ─ */}
                  {step===2 && (
                    <div className="step-slide">
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("farmName")} error={errors.farmName}>
                          <input className={`field-input${errors.farmName?" err":""}`} placeholder={t("farmPlaceholder")} value={form.farmName} onChange={e=>update("farmName",e.target.value)} />
                        </Field>
                        <Field label={t("cropType")} error={errors.farmType}>
                          <select className={`field-input${errors.farmType?" err":""}`} value={form.farmType} onChange={e=>update("farmType",e.target.value)}>
                            <option value="">{t("selectCrop")}</option>
                            {FARM_TYPES.map(f=><option key={f} value={f}>{f}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("landSize")} error={errors.landSize}>
                          <select className={`field-input${errors.landSize?" err":""}`} value={form.landSize} onChange={e=>update("landSize",e.target.value)}>
                            <option value="">{t("selectLand")}</option>
                            {LAND_SIZES.map(l=><option key={l} value={l}>{l}</option>)}
                          </select>
                        </Field>
                        <Field label={t("state")} error={errors.state}>
                          <select className={`field-input${errors.state?" err":""}`} value={form.state} onChange={e=>update("state",e.target.value)}>
                            <option value="">{t("selectState")}</option>
                            {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("district")} error={errors.district}>
                          <input className={`field-input${errors.district?" err":""}`} placeholder={t("districtPlaceholder")} value={form.district} onChange={e=>update("district",e.target.value)} />
                        </Field>
                        <Field label={t("village")}>
                          <input className="field-input" placeholder={t("villagePlaceholder")} value={form.village} onChange={e=>update("village",e.target.value)} />
                        </Field>
                      </div>
                      <div style={{ display:"flex",gap:12 }}>
                        <button className="btn-back" onClick={()=>setStep(1)}>{t("back")}</button>
                        <button className="btn-primary" style={{ flex:2 }} onClick={nextStep}>{t("continueToPrefs")}</button>
                      </div>
                    </div>
                  )}

                  {/* ─ STEP 3 ─ */}
                  {step===3 && (
                    <div className="step-slide">
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                        <Field label={t("irrigationType")}>
                          <select className="field-input" value={form.irrigationType} onChange={e=>update("irrigationType",e.target.value)}>
                            <option value="">{t("selectIrrigation")}</option>
                            <option value="Drip">{t("drip")}</option>
                            <option value="Sprinkler">{t("sprinkler")}</option>
                            <option value="Flood">{t("flood")}</option>
                            <option value="Borewell">{t("borewell")}</option>
                            <option value="Rainfed">{t("rainfed")}</option>
                          </select>
                        </Field>
                        <Field label={t("soilType")}>
                          <select className="field-input" value={form.soilType} onChange={e=>update("soilType",e.target.value)}>
                            <option value="">{t("selectSoil")}</option>
                            <option value="BlackCotton">{t("blackCotton")}</option>
                            <option value="Red">{t("redSoil")}</option>
                            <option value="Alluvial">{t("alluvial")}</option>
                            <option value="Sandy">{t("sandySoil")}</option>
                            <option value="Laterite">{t("laterite")}</option>
                          </select>
                        </Field>
                      </div>

                      <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"rgba(240,253,244,0.8)",border:"1px solid rgba(134,239,172,0.4)",borderRadius:12,marginBottom:12 }}>
                        <div onClick={()=>update("notifications",!form.notifications)} className={`toggle-check${form.notifications?" checked":""}`}>
                          {form.notifications&&<span style={{ color:"white",fontSize:12 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontFamily:"'DM Sans'",fontSize:14,fontWeight:500,color:"#14532d" }}>{t("smartAlerts")}</div>
                          <div style={{ fontFamily:"'DM Sans'",fontSize:12,color:"#6aaa6a",fontWeight:300 }}>{t("alertsDesc")}</div>
                        </div>
                      </div>

                      <div style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",background:errors.agreeTerms?"rgba(254,242,242,0.8)":"rgba(240,253,244,0.8)",border:`1px solid ${errors.agreeTerms?"rgba(248,113,113,0.4)":"rgba(134,239,172,0.4)"}`,borderRadius:12,marginBottom:12 }}>
                        <div onClick={()=>update("agreeTerms",!form.agreeTerms)} className={`toggle-check${form.agreeTerms?" checked":""}`} style={{ marginTop:1 }}>
                          {form.agreeTerms&&<span style={{ color:"white",fontSize:12 }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#14532d",lineHeight:1.5 }}>
                            {t("termsText")}{" "}<span style={{ color:"#16a34a",fontWeight:600,cursor:"pointer",textDecoration:"underline" }}>{t("termsOfService")}</span>{" "}{t("and")}{" "}<span style={{ color:"#16a34a",fontWeight:600,cursor:"pointer",textDecoration:"underline" }}>{t("privacyPolicy")}</span>
                          </div>
                          {errors.agreeTerms&&<div style={{ fontFamily:"'DM Sans'",fontSize:11,color:"#ef4444",marginTop:3 }}>{errors.agreeTerms}</div>}
                        </div>
                      </div>

                      {/* ── API ERROR BANNER ── */}
                      {apiError && (
                        <div style={{ background:"rgba(254,242,242,0.95)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,padding:"10px 14px",marginBottom:12,fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#ef4444" }}>
                          ⚠️ {apiError}
                        </div>
                      )}

                      <div style={{ display:"flex",gap:12 }}>
                        <button className="btn-back" onClick={()=>setStep(2)} disabled={loading}>{t("back")}</button>
                        <button className="btn-primary" style={{ flex:2 }} onClick={nextStep} disabled={loading}>
                          {loading ? <><span className="spinner" />{" "}Saving...</> : t("createMyAccount")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── SUCCESS ── */
                <div style={{ textAlign:"center",padding:"20px 0" }}>
                  <div className="success-icon" style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 12px 40px rgba(34,197,94,0.4)" }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <path className="check-path" d="M8 20 L16 28 L32 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#14532d",marginBottom:10 }}>{t("welcomeUser")}, {form.fullName.split(" ")[0]}! 🌾</h2>
                  <p style={{ fontFamily:"'DM Sans'",fontSize:15,color:"#6aaa6a",fontWeight:300,marginBottom:6 }}>{t("accountCreated")}</p>
                  <p style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#a7c4a7",marginBottom:28 }}>{t("verificationSent")} <strong style={{ color:"#16a34a" }}>{form.email}</strong></p>
                  <div style={{ background:"rgba(240,253,244,0.8)",border:"1px solid rgba(134,239,172,0.4)",borderRadius:16,padding:"20px",marginBottom:24,textAlign:"left" }}>
                    <div style={{ fontFamily:"'DM Sans'",fontSize:11,color:"#22c55e",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:12,fontWeight:600 }}>{t("accountSummary")}</div>
                    {[{icon:"👤",l:t("nameLabel"),v:form.fullName},{icon:"🌾",l:t("farmLabel"),v:form.farmName},{icon:"📍",l:t("locationLabel"),v:`${form.district}, ${form.state}`},{icon:"🌱",l:t("cropLabel"),v:form.farmType},{icon:"📐",l:t("landLabel"),v:form.landSize}].map(r=>(
                      <div key={r.l} style={{ display:"flex",gap:10,marginBottom:8,alignItems:"center" }}>
                        <span style={{ fontSize:16 }}>{r.icon}</span>
                        <span style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",minWidth:70 }}>{r.l}</span>
                        <span style={{ fontFamily:"'DM Sans'",fontSize:13,fontWeight:500,color:"#14532d" }}>{r.v||"—"}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={()=>navigate("/login")} style={{ marginTop:0 }}>{t("goToLogin")}</button>
                  <p style={{ fontFamily:"'DM Sans'",fontSize:12,color:"#a7c4a7",marginTop:14 }}>{t("checkEmail")}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </BG>
  );
}