import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/Languagecontext";

const floatingItems = [
  { emoji:"🌾", size:44, x:4,  y:12, delay:0,   duration:6   },
  { emoji:"🌿", size:32, x:91, y:18, delay:1,   duration:7   },
  { emoji:"🌱", size:28, x:6,  y:72, delay:2,   duration:5.5 },
  { emoji:"🍃", size:24, x:89, y:68, delay:0.5, duration:8   },
  { emoji:"☀️", size:38, x:48, y:4,  delay:1.5, duration:6   },
  { emoji:"💧", size:22, x:92, y:42, delay:2.5, duration:7   },
];

export default function Login() {
  const navigate = useNavigate();
  const { setLang } = useLang();

  const [view,          setView]          = useState("login");
  const [showPass,      setShowPass]      = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [apiError,      setApiError]      = useState("");
  const [otp,           setOtp]           = useState(["","","","","",""]);
  const [otpError,      setOtpError]      = useState("");
  const [resendTimer,   setResendTimer]   = useState(0);

  const [form, setForm] = useState({
    email:"", password:"", rememberMe:false,
    forgotEmail:"", newPassword:"", confirmNewPassword:"",
  });

  const update = (field, val) => {
    setForm(f=>({...f,[field]:val}));
    setErrors(e=>({...e,[field]:""}));
    setApiError("");
  };

  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next=[...otp]; next[i]=val.slice(-1); setOtp(next); setOtpError("");
    if (val && i<5) document.getElementById(`otp-${i+1}`)?.focus();
  };
  const handleOtpKey = (i,e) => {
    if (e.key==="Backspace" && !otp[i] && i>0) document.getElementById(`otp-${i-1}`)?.focus();
  };
  const startTimer = () => {
    setResendTimer(30);
    const id = setInterval(()=>setResendTimer(p=>{ if(p<=1){clearInterval(id);return 0;} return p-1; }),1000);
  };

  // ── REAL LOGIN — saves ALL signup fields to localStorage ──────────────────
  const handleLogin = async () => {
    const e={};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email="Enter a valid email";
    if (!form.password) e.password="Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true); setApiError("");
    try {
      const res  = await fetch("http://localhost:5000/api/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email:form.email, password:form.password }),
      });
      const data = await res.json();

      if (data.success) {
        const u = data.user;

        // ✅ Save everything from signup to localStorage
        setLang(u.language || "en");
        localStorage.setItem("userName",       u.fullName       || "");
        localStorage.setItem("farmName",        u.farmName       || "");
        localStorage.setItem("farmType",        u.farmType       || "");   // ← crop type
        localStorage.setItem("landSize",        u.landSize       || "");   // ← for water calc
        localStorage.setItem("soilType",        u.soilType       || "");   // ← for disease
        localStorage.setItem("irrigationType",  u.irrigationType || "");
        localStorage.setItem("state",           u.state          || "");
        localStorage.setItem("district",        u.district       || "");

        navigate("/home");
      } else {
        setApiError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setApiError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    if (!form.forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setErrors({forgotEmail:"Enter a valid email"}); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setView("otp"); startTimer(); },1500);
  };
  const handleOtpVerify = () => {
    if (otp.join("").length<6){ setOtpError("Enter all 6 digits"); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setView("reset"); },1400);
  };
  const handleReset = () => {
    const e={};
    if (form.newPassword.length<8) e.newPassword="Minimum 8 characters";
    if (form.newPassword!==form.confirmNewPassword) e.confirmNewPassword="Passwords do not match";
    setErrors(e); if(Object.keys(e).length) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setView("success"); },1500);
  };

  const getStr = pw => { let s=0; if(pw.length>=8)s++; if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++; return s; };
  const strColor = s => s<=1?"#ef4444":s===2?"#f97316":s===3?"#eab308":"#22c55e";
  const strLabel = s => s<=1?"Weak":s===2?"Fair":s===3?"Good":"Strong";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px) rotate(4deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes orb{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.08) translate(18px,-14px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes successPop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes checkDraw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .float-item{animation:floatY var(--dur,6s) ease-in-out infinite;animation-delay:var(--delay,0s);}
        .card{animation:fadeUp 0.5s ease forwards;}
        .view-slide{animation:slideIn 0.32s ease forwards;}
        .field-input{width:100%;background:rgba(255,255,255,0.82);border:1.5px solid rgba(134,239,172,0.6);border-radius:12px;padding:13px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:#14532d;outline:none;transition:all 0.22s;}
        .field-input:focus{border-color:#22c55e;background:#fff;box-shadow:0 0 0 3px rgba(34,197,94,0.12);}
        .field-input::placeholder{color:#a7c4a7;}
        .field-input.err{border-color:#f87171;background:#fff5f5;animation:shake 0.4s ease;}
        .btn-main{width:100%;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:14px;border-radius:14px;cursor:pointer;transition:all 0.28s;box-shadow:0 6px 24px rgba(34,197,94,0.35);}
        .btn-main:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 36px rgba(34,197,94,0.42);}
        .btn-main:disabled{opacity:0.75;cursor:not-allowed;}
        .btn-ghost{background:transparent;border:1.5px solid rgba(34,197,94,0.3);color:#166534;font-family:'DM Sans',sans-serif;font-weight:500;font-size:14px;padding:12px;border-radius:14px;cursor:pointer;transition:all 0.2s;width:100%;}
        .btn-ghost:hover{background:rgba(34,197,94,0.06);border-color:#22c55e;}
        .otp-box{width:48px;height:56px;text-align:center;font-size:22px;font-weight:700;font-family:'Playfair Display',serif;color:#14532d;background:rgba(255,255,255,0.85);border:2px solid rgba(134,239,172,0.6);border-radius:12px;outline:none;transition:all 0.2s;}
        .otp-box:focus{border-color:#22c55e;background:#fff;box-shadow:0 0 0 3px rgba(34,197,94,0.12);}
        .otp-box.filled{border-color:#22c55e;background:rgba(240,253,244,0.9);}
        .otp-box.otp-err{border-color:#f87171;animation:shake 0.4s ease;}
        .social-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:12px;border:1.5px solid rgba(134,239,172,0.5);background:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#14532d;}
        .social-btn:hover{background:#fff;border-color:#22c55e;transform:translateY(-1px);}
        .toggle-check{width:20px;height:20px;border-radius:6px;border:2px solid rgba(34,197,94,0.5);background:rgba(255,255,255,0.8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;}
        .toggle-check.on{background:#22c55e;border-color:#22c55e;}
        .check-path{stroke-dasharray:100;animation:checkDraw 0.6s ease 0.3s forwards;stroke-dashoffset:100;}
        .success-icon{animation:successPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards;}
      `}</style>

      {/* Orbs */}
      <div style={{ position:"absolute",top:"8%",left:"4%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(134,239,172,0.45) 0%,transparent 70%)",animation:"orb 13s ease-in-out infinite",pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:"4%",right:"4%",width:460,height:460,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.3) 0%,transparent 70%)",animation:"orb 17s ease-in-out infinite reverse",pointerEvents:"none" }} />
      {floatingItems.map((item,i) => (
        <div key={i} className="float-item" style={{ position:"absolute",left:`${item.x}%`,top:`${item.y}%`,fontSize:item.size,"--dur":`${item.duration}s`,"--delay":`${item.delay}s`,opacity:0.6,pointerEvents:"none",userSelect:"none" }}>{item.emoji}</div>
      ))}

      <div className="card" style={{ width:"100%",maxWidth:460,background:"rgba(255,255,255,0.87)",backdropFilter:"blur(22px)",border:"1px solid rgba(134,239,172,0.5)",borderRadius:28,padding:"40px 44px",boxShadow:"0 24px 80px rgba(34,197,94,0.15),0 2px 0 rgba(255,255,255,0.8) inset" }}>

        {/* ── LOGIN ── */}
        {view==="login" && (
          <div className="view-slide">
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:34,marginBottom:10 }}>🌾</div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#14532d",marginBottom:6 }}>Welcome Back</h1>
              <p style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",fontWeight:300 }}>Sign in to your Smart Farmer dashboard</p>
            </div>

            <div style={{ display:"flex",gap:10,marginBottom:4 }}>
              <button className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>

            <div style={{ margin:"18px 0",display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ flex:1,height:1,background:"rgba(134,239,172,0.4)" }} />
              <span style={{ fontFamily:"'DM Sans'",fontSize:12,color:"#a7c4a7" }}>or sign in with email</span>
              <div style={{ flex:1,height:1,background:"rgba(134,239,172,0.4)" }} />
            </div>

            <Field label="Email Address" error={errors.email} mb={14}>
              <input className={`field-input${errors.email?" err":""}`} type="email" placeholder="you@example.com" value={form.email} onChange={e=>update("email",e.target.value)} onKeyDown={e=>e.key==="Enter"&&document.getElementById("lpass")?.focus()} />
            </Field>
            <Field label="Password" error={errors.password} mb={8}>
              <div style={{ position:"relative" }}>
                <input id="lpass" className={`field-input${errors.password?" err":""}`} type={showPass?"text":"password"} placeholder="Your password" value={form.password} onChange={e=>update("password",e.target.value)} style={{ paddingRight:44 }} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
                <button onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:17,opacity:0.55 }}>{showPass?"🙈":"👁️"}</button>
              </div>
            </Field>

            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={()=>update("rememberMe",!form.rememberMe)}>
                <div className={`toggle-check${form.rememberMe?" on":""}`}>{form.rememberMe&&<span style={{ color:"white",fontSize:11 }}>✓</span>}</div>
                <span style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#4b8b4b" }}>Remember me</span>
              </div>
              <button onClick={()=>setView("forgot")} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:"#16a34a",fontWeight:600,textDecoration:"underline" }}>Forgot Password?</button>
            </div>

            {apiError && (
              <div style={{ background:"rgba(254,242,242,0.95)",border:"1px solid rgba(248,113,113,0.4)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontFamily:"'DM Sans'",fontSize:13,color:"#ef4444" }}>⚠️ {apiError}</div>
            )}

            <button className="btn-main" onClick={handleLogin} disabled={loading}>
              {loading ? <Spinner text="Signing in..." /> : "Sign In to Dashboard →"}
            </button>

            <p style={{ textAlign:"center",fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",marginTop:20 }}>
              Don't have an account?{" "}
              <span onClick={()=>navigate("/signup")} style={{ color:"#16a34a",fontWeight:600,cursor:"pointer",textDecoration:"underline" }}>Create Free Account</span>
            </p>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:18,padding:"10px 16px",background:"rgba(240,253,244,0.7)",borderRadius:10,border:"1px solid rgba(134,239,172,0.3)" }}>
              <span style={{ fontSize:14 }}>🔒</span>
              <span style={{ fontFamily:"'DM Sans'",fontSize:11,color:"#6aaa6a" }}>256-bit SSL encrypted · Your data is safe</span>
            </div>
          </div>
        )}

        {/* ── FORGOT ── */}
        {view==="forgot" && (
          <div className="view-slide">
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🔑</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#14532d",marginBottom:8 }}>Forgot Password?</h2>
              <p style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",fontWeight:300,lineHeight:1.6 }}>Enter your registered email and we'll send a 6-digit OTP.</p>
            </div>
            <StepDots active={0} />
            <Field label="Registered Email" error={errors.forgotEmail} mb={20}>
              <input className={`field-input${errors.forgotEmail?" err":""}`} type="email" placeholder="you@example.com" value={form.forgotEmail} onChange={e=>update("forgotEmail",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgot()} autoFocus />
            </Field>
            <button className="btn-main" onClick={handleForgot} disabled={loading}>{loading?<Spinner text="Sending..." />:"Send OTP →"}</button>
            <button className="btn-ghost" onClick={()=>setView("login")} style={{ marginTop:12 }}>← Back to Login</button>
          </div>
        )}

        {/* ── OTP ── */}
        {view==="otp" && (
          <div className="view-slide">
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📱</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#14532d",marginBottom:8 }}>Enter OTP</h2>
              <p style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#6aaa6a",fontWeight:300,lineHeight:1.6 }}>Code sent to <strong style={{ color:"#16a34a" }}>{form.forgotEmail}</strong></p>
            </div>
            <StepDots active={1} />
            <div style={{ display:"flex",gap:10,justifyContent:"center",marginBottom:8 }}>
              {otp.map((d,i) => <input key={i} id={`otp-${i}`} className={`otp-box${d?" filled":""}${otpError?" otp-err":""}`} value={d} onChange={e=>handleOtp(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)} maxLength={1} inputMode="numeric" autoFocus={i===0} />)}
            </div>
            {otpError && <p style={{ fontFamily:"'DM Sans'",fontSize:12,color:"#ef4444",textAlign:"center",marginBottom:8 }}>⚠ {otpError}</p>}
            <div style={{ textAlign:"center",marginBottom:22 }}>
              {resendTimer>0 ? <span style={{ fontFamily:"'DM Sans'",fontSize:13,color:"#a7c4a7" }}>Resend in <strong style={{ color:"#16a34a" }}>{resendTimer}s</strong></span>
                : <button onClick={()=>{setOtp(["","","","","",""]);startTimer();}} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",fontSize:13,color:"#16a34a",fontWeight:600,textDecoration:"underline" }}>Resend OTP</button>}
            </div>
            <button className="btn-main" onClick={handleOtpVerify} disabled={loading}>{loading?<Spinner text="Verifying..." />:"Verify OTP →"}</button>
            <button className="btn-ghost" onClick={()=>setView("forgot")} style={{ marginTop:12 }}>← Change Email</button>
          </div>
        )}

        {/* ── RESET ── */}
        {view==="reset" && (
          <div className="view-slide">
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🔐</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#14532d",marginBottom:8 }}>Set New Password</h2>
            </div>
            <StepDots active={2} />
            <Field label="New Password" error={errors.newPassword} mb={14}>
              <div style={{ position:"relative" }}>
                <input className={`field-input${errors.newPassword?" err":""}`} type={showNew?"text":"password"} placeholder="Min 8 characters" value={form.newPassword} onChange={e=>update("newPassword",e.target.value)} style={{ paddingRight:44 }} autoFocus />
                <button onClick={()=>setShowNew(p=>!p)} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:17,opacity:0.55 }}>{showNew?"🙈":"👁️"}</button>
              </div>
            </Field>
            {form.newPassword && (
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                  {[1,2,3,4].map(i=>{ const s=getStr(form.newPassword); return <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=s?strColor(s):"rgba(134,239,172,0.3)",transition:"all 0.3s" }} />; })}
                </div>
                <span style={{ fontFamily:"'DM Sans'",fontSize:11,color:strColor(getStr(form.newPassword)) }}>{strLabel(getStr(form.newPassword))}</span>
              </div>
            )}
            <Field label="Confirm Password" error={errors.confirmNewPassword} mb={22}>
              <div style={{ position:"relative" }}>
                <input className={`field-input${errors.confirmNewPassword?" err":""}`} type={showConfirm?"text":"password"} placeholder="Repeat new password" value={form.confirmNewPassword} onChange={e=>update("confirmNewPassword",e.target.value)} style={{ paddingRight:44 }} onKeyDown={e=>e.key==="Enter"&&handleReset()} />
                <button onClick={()=>setShowConfirm(p=>!p)} style={{ position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:17,opacity:0.55 }}>{showConfirm?"🙈":"👁️"}</button>
                {form.confirmNewPassword && form.newPassword===form.confirmNewPassword && <span style={{ position:"absolute",right:42,top:"50%",transform:"translateY(-50%)",color:"#22c55e",fontSize:16 }}>✓</span>}
              </div>
            </Field>
            <button className="btn-main" onClick={handleReset} disabled={loading}>{loading?<Spinner text="Resetting..." />:"Reset Password 🔐"}</button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {view==="success" && (
          <div className="view-slide" style={{ textAlign:"center",padding:"20px 0" }}>
            <div className="success-icon" style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"0 12px 40px rgba(34,197,94,0.4)" }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path className="check-path" d="M8 20 L16 28 L32 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#14532d",marginBottom:10 }}>Password Reset! 🎉</h2>
            <p style={{ fontFamily:"'DM Sans'",fontSize:14,color:"#6aaa6a",marginBottom:28,lineHeight:1.6 }}>You can now sign in with your new password.</p>
            <button className="btn-main" onClick={()=>{ setView("login"); setForm(f=>({...f,forgotEmail:"",newPassword:"",confirmNewPassword:""})); setOtp(["","","","","",""]); }}>Go to Login →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children, mb=16 }) {
  return (
    <div style={{ marginBottom:mb }}>
      <label style={{ fontFamily:"'DM Sans'",fontSize:11,fontWeight:600,color:"#4b8b4b",letterSpacing:"0.6px",textTransform:"uppercase",display:"block",marginBottom:6 }}>{label}</label>
      {children}
      {error && <div style={{ fontFamily:"'DM Sans'",fontSize:11,color:"#ef4444",marginTop:4 }}>⚠ {error}</div>}
    </div>
  );
}

function StepDots({ active }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28 }}>
      {["Email","OTP","Reset"].map((s,i) => (
        <div key={s} style={{ display:"flex",alignItems:"center" }}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:i<active?"#22c55e":i===active?"#14532d":"rgba(134,239,172,0.4)",color:i<=active?"white":"#a7c4a7",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans'",fontSize:12,fontWeight:600 }}>{i<active?"✓":i+1}</div>
            <span style={{ fontFamily:"'DM Sans'",fontSize:10,color:i<=active?"#14532d":"#a7c4a7" }}>{s}</span>
          </div>
          {i<2 && <div style={{ width:44,height:2,background:i<active?"linear-gradient(90deg,#22c55e,#86efac)":"rgba(134,239,172,0.3)",margin:"0 6px 16px",borderRadius:2 }} />}
        </div>
      ))}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
      <span style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }} />
      {text}
    </span>
  );
}