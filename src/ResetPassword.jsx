import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const COR = { laranja: "#FF5A1F", escuro: "#0D0D0D", card: "#1A1A1A" };

function BtnPrimary({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: disabled ? "#444" : "linear-gradient(135deg,#FF5A1F,#FF8C42)", color: disabled ? "#888" : "#fff", border: "none", borderRadius: 50, padding: "14px", fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

export default function ResetPassword() {
  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);
  const [ready,     setReady]     = useState(false);
  const [expired,   setExpired]   = useState(false);

  useEffect(function() {
    // Supabase processa automaticamente o hash da URL e cria uma sessão
    supabase.auth.onAuthStateChange(function(event) {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Verifica se o link está expirado
    var hash = window.location.hash;
    if (hash.includes("error_code=otp_expired") || hash.includes("error=access_denied")) {
      setExpired(true);
    }
  }, []);

  async function handleReset() {
    if (!password || !password2) { setError("Preencha os dois campos."); return; }
    if (password.length < 6)     { setError("A senha deve ter no mínimo 6 caracteres."); return; }
    if (password !== password2)  { setError("As senhas não coincidem."); return; }
    setLoading(true); setError(null);
    var { error } = await supabase.auth.updateUser({ password: password });
    if (error) { setError("Erro ao redefinir senha. Tente novamente."); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
    setTimeout(function() { window.location.href = "/"; }, 3000);
  }

  return (
    <div style={{ minHeight: "100vh", background: COR.escuro, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽️</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>foto<span style={{ color: COR.laranja }}>cardápio</span></span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Redefinir senha</h2>
        </div>

        <div style={{ background: COR.card, borderRadius: 20, padding: "32px 28px", border: "1px solid #2a2a2a" }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ color: "#88ff88", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Senha redefinida com sucesso!</p>
              <p style={{ color: "#666", fontSize: 13 }}>Redirecionando para o site...</p>
            </div>
          ) : expired ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏱️</div>
              <p style={{ color: "#ffcc66", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Link expirado</p>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>Este link de recuperação não é mais válido. Solicite um novo.</p>
              <button onClick={function() { window.location.href = "/"; }}
                style={{ background: "linear-gradient(135deg,#FF5A1F,#FF8C42)", color: "#fff", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Voltar ao site
              </button>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ color: "#888", fontSize: 14 }}>Verificando link de recuperação...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#aaa", display: "block", marginBottom: 6 }}>Nova senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#aaa", display: "block", marginBottom: 6 }}>Confirmar nova senha</label>
                <input type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                  placeholder="repita a senha"
                  onKeyDown={e => e.key === "Enter" && handleReset()}
                  style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
              </div>
              {error && <div style={{ background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ff8888", marginBottom: 16 }}>❌ {error}</div>}
              <BtnPrimary onClick={handleReset} disabled={loading}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </BtnPrimary>
            </>
          )}
        </div>
      </div>
    </div>
  );
}