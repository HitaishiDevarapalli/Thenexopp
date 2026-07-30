import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export const ContactUs: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Properties',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('🔒 Login required to submit contact inquiries. Please sign in to continue.');
      openLoginModal();
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'Properties',
        message: ''
      });
    }, 4000);
  };

  return (
    <section id="contact" className="section-padding contact-section">
      <div className="container">
        <div className="contact-grid">
          {/* Left Column: Form */}
          <div className="contact-form-container premium-card">
            <h3 className="form-heading">Initiate Consultation</h3>
            <p className="form-subheading">Submit your requirements and an acquisition director will reach out within 24 hours.</p>

            {submitted ? (
              <div className="submission-success">
                <h4>Thank You</h4>
                <p>Your inquiry has been logged securely. A portfolio director has been assigned and will call you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="luxury-form">
                <div className="form-row-double">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Contact Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row-double">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Inquiry Portfolio</label>
                    <select 
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Properties">Properties (Buy, Sell, Rent)</option>
                      <option value="Franchise">Franchise Opportunities</option>
                      <option value="Business">Business Acquisition / Sale</option>
                      <option value="Finance">Finance & Insurance Desk</option>
                      <option value="Services">Professional Advisory Desk</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Requirements / Notes</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gold w-full mt-2">
                  Request Confidential Callback
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Office Details & Mock Map */}
          <div className="contact-details-container">
            <span className="section-tag">Registry Headquarters</span>
            <h2 className="section-title">Get In Touch</h2>
            
            <div className="contact-info-list">
              <div className="contact-info-item">
                <span className="info-icon"><FaMapMarkerAlt /></span>
                <div className="info-text">
                  <h4>TheNexopp Towers</h4>
                  <p>Level 14, Financial District, Gachibowli, Hyderabad - 500032</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="info-icon"><FaPhoneAlt /></span>
                <div className="info-text">
                  <h4>Priority Desk</h4>
                  <p>+91 40 4900 2200 / +91 80 5600 7800</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="info-icon"><FaEnvelope /></span>
                <div className="info-text">
                  <h4>Email Inquiries</h4>
                  <p>desk@thenexopp.in / acquisitions@thenexopp.in</p>
                </div>
              </div>
            </div>

            {/* Real Map widget */}
            <div className="real-map-widget premium-card" style={{ height: '220px', overflow: 'hidden', position: 'relative', marginTop: '1.5rem' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.8272225611135!2d78.3415!3d17.4262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93f21132711d%3A0x6b772be425e24b45!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="TheNexopp Towers Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
