import { useState } from 'react';

const KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!KEY) {
      setStatus('error');
      setError('Form is not configured yet. Please try email instead.');
      return;
    }
    setStatus('sending');
    setError('');
    const formData = new FormData(e.target);
    formData.append('access_key', KEY);
    formData.append('subject', 'New inquiry — Monkey Mind');
    formData.append('from_name', 'Monkey Mind Website');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        e.target.reset();
      } else {
        setStatus('error');
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Check your connection and try again.');
    }
  };

  return (
    <section className="contact-sec">
      <div className="wrap contact-inner">
        <h2 className="contact-title">Get in touch</h2>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="cf-row">
            <label className="cf-field">
              <span className="cf-label">First name</span>
              <input type="text" name="first_name" placeholder="taylor" required autoComplete="given-name" />
            </label>
            <label className="cf-field">
              <span className="cf-label">Last name</span>
              <input type="text" name="last_name" placeholder="barbara" required autoComplete="family-name" />
            </label>
          </div>
          <label className="cf-field">
            <span className="cf-label">Email</span>
            <input type="email" name="email" placeholder="taylor@gmail.com" required autoComplete="email" />
          </label>
          <label className="cf-field">
            <span className="cf-label">Message</span>
            <textarea name="message" placeholder="Enter your message..." rows={6} required />
          </label>
          <input type="checkbox" name="botcheck" className="cf-honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button type="submit" className="cf-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
          {status === 'success' && (
            <p className="cf-note ok" role="status">Thanks — your message is on its way. We&apos;ll get back to you soon.</p>
          )}
          {status === 'error' && (
            <p className="cf-note err" role="alert">{error}</p>
          )}
        </form>
      </div>
    </section>
  );
}
