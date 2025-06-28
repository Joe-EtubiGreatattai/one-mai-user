import React, { useState } from 'react';

const Support = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend or support system
        setSubmitted(true);
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2>Support</h2>
            <p>If you have any questions or need help, please fill out the form below and our support team will get back to you.</p>
            {submitted ? (
                <div style={{ color: 'green', marginTop: 20 }}>
                    Thank you for contacting support! We will get back to you soon.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label>Message</label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '10px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
};

export default Support;