import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || form.password.length < 4) {
      setError("Sahi naam, email, aur kam se kam 4 character ka password daalein.");
      return;
    }
    const result = signup(form.name, form.email, form.password);
    if (!result.success) { setError(result.message); return; }
    navigate("/store");
  };

  return (
    <main className="page"><div className="container">
      <div className="page-heading"><div><h1 className="display">Signup</h1></div></div>
      <form className="checkout-form" onSubmit={onSubmit} noValidate style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="signup-name">Name</label>
          <input id="signup-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Choose a password" />
        </div>
        {error && <span className="field-error">{error}</span>}
        <button className="button button-coral" type="submit">Create account</button>
      </form>
<p style={{ marginTop: 12, fontSize: 10, paddingLeft: 140 }}>
  Already have account?<Link href="/login"> Login </Link>
</p>
    </div></main>
  );
}