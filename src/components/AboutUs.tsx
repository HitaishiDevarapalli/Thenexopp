import React, { useState, useEffect } from 'react';
import { teamMembersDb } from '../db/marketplaceDb';
import type { TeamMember } from '../db/marketplaceDb';
import { FaLinkedinIn, FaPhoneAlt, FaUserTie, FaEnvelope } from 'react-icons/fa';

export const AboutUs: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(teamMembersDb);

  useEffect(() => {
    const handler = () => setTeam([...teamMembersDb]);
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, []);

  return (
    <section className="section-padding about-section" style={{ backgroundColor: '#F8FAFC', padding: '60px 20px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: '#EFF6FF', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', marginBottom: '16px' }}>
            Executive Leadership
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0', letterSpacing: '-0.03em' }}>
            Meet the Visionaries Behind TheNexOpp
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Our team brings together decades of deep expertise across luxury real estate, institutional finance, enterprise mergers, and strategic franchise scaling.
          </p>
        </div>

        {/* Team Grid */}
        {team.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
            <FaUserTie style={{ fontSize: '3rem', color: '#94A3B8', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>No Leadership Profiles Added Yet</h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Profiles added via the Admin Portal will appear here dynamically.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {team.map((member) => (
              <div
                key={member.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.04)';
                }}
              >
                {/* Photo */}
                <div style={{ width: '100%', height: '320px', position: 'relative', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <img
                    src={member.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)' }} />
                </div>

                {/* Info */}
                <div style={{ padding: '28px 24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                      {member.name}
                    </h3>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2563EB', margin: '0 0 20px 0' }}>
                      {member.designation}
                    </p>
                  </div>

                  {/* Actions / Contact */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
                      >
                        <FaPhoneAlt style={{ color: '#2563EB', fontSize: '0.8rem' }} />
                        <span>{member.phone}</span>
                      </a>
                    ) : <div />}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {member.email ? (
                        <a
                          href={`mailto:${member.email}`}
                          aria-label="Email Profile"
                          style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
                        >
                          <FaEnvelope />
                        </a>
                      ) : null}
                      {member.linkedin ? (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn Profile"
                          style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }}
                        >
                          <FaLinkedinIn />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default AboutUs;
