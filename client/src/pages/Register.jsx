import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register({ onSwitch }) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.password) return toast('All fields are required.', 'err');
    setLoading(true);
    try { await register(form); toast('Registration submitted for administrative approval.'); onSwitch(); }
    catch (err) { toast(err.response?.data?.msg || 'Backend offline — start the server to register.', 'err'); }
    finally { setLoading(false); }
  };

  return (
    <main className="reg-screen">
      <section className="reg-card">
        <h1 className="reg-title">Register</h1>
        <form onSubmit={submit} className="auth-form">
          <label className="label light">Name</label>
          <input className="input" value={form.name} onChange={update('name')} placeholder="Enter your full name" />
          <label className="label light">Phone Number</label>
          <input className="input" value={form.phone} onChange={update('phone')} placeholder="Enter your phone number" />
          <label className="label light">Email address</label>
          <input className="input" type="email" value={form.email} onChange={update('email')} placeholder="Enter your email address" />
          <label className="label light">Password</label>
          <div className="relative">
            <input className="input" type={show ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Enter your password" style={{ paddingRight: 38 }} />
            <button type="button" onClick={() => setShow((v) => !v)} className="eye-btn dark">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <button className="btn-slate" type="submit" disabled={loading}>{loading && <Loader2 size={16} className="spin" />} Register</button>
        </form>
        <p className="reg-foot">Already have an account? <button className="reg-link" onClick={onSwitch}>Sign in</button></p>
      </section>
    </main>
  );
}