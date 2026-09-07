import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = login(form.email, form.password);
    if (!result.success) { setError(result.message); return; }
    navigate("/store");
  };

  return (
    <main className="page"><div className="container">
      <div className="page-heading"><div><h1 className="display">Login</h1></div></div>
      <form className="checkout-form" onSubmit={onSubmit} noValidate style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
        </div>
        {error && <span className="field-error">{error}</span>}
        <button className="button button-coral" type="submit">Login</button>
      </form>
<p style={{ marginTop: 12, fontSize: 10, paddingLeft: 140 }}>
  Don't have an account? <Link href="/signup">Sign up</Link>
</p>
    </div></main>
  );
}