const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// 1. Imports
content = content.replace(
  /import { propertiesDb, dealersDb, selectedCity, setSelectedCity, siteSettingsDb } from '\.\.\/db\/marketplaceDb';/,
  "import { propertiesDb, dealersDb, selectedCity, setSelectedCity, siteSettingsDb, franchiseDb, businessDb } from '../db/marketplaceDb';\nimport { useLocationStore } from '../context/LocationContext';"
);

// 2. Component init
content = content.replace(
  /export const HomePage: React\.FC<HomePageProps> = \(\{ onNavigate, onPropertyClick \}\) => \{/,
  "export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onPropertyClick }) => {\n  const { location } = useLocationStore();\n  const currentGlobalCity = location?.city || location?.displayName || selectedCity || 'Guntur';"
);

// 3. featuredListings
content = content.replace(
  /const featuredListings = propertiesDb\.slice\(0, 4\)\.map\(\(p\) => \{/,
  "const featuredListings = propertiesDb.filter(p => !p.sold && p.approvalStatus !== 'Sold' && p.listingStatus !== 'Sold' && (p.city?.toLowerCase() === currentGlobalCity.toLowerCase() || (p.area || '').toLowerCase().includes(currentGlobalCity.toLowerCase()))).slice(0, 4).map((p) => {"
);

// 4. Add franchise and business lists
content = content.replace(
  /      listingStatus: p\.listingStatus,\n    };\n  \}\);\n\n  return \(/,
  "      listingStatus: p.listingStatus,\n    };\n  });\n\n  const featuredFranchises = franchiseDb\n    .filter(f => (f.city || '').toLowerCase() === currentGlobalCity.toLowerCase() || (f.location || '').toLowerCase().includes(currentGlobalCity.toLowerCase()))\n    .slice(0, 4);\n\n  const featuredBusinesses = businessDb\n    .filter(b => (b.city || '').toLowerCase() === currentGlobalCity.toLowerCase() || (b.location || '').toLowerCase().includes(currentGlobalCity.toLowerCase()))\n    .slice(0, 4);\n\n  return ("
);

// 5. Add the JSX sections right before the recently sold section (line 1017)
const renderSection = `
      {/* FEATURED PROPERTIES GRID */}
      {featuredListings.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 20px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Properties in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Top recommended residential and commercial properties.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {featuredListings.map((prop, idx) => (
              <div
                key={idx}
                onClick={() => onPropertyClick ? onPropertyClick(prop.id) : onNavigate('propertyDetails', \`?propertyId=\${prop.id}\`)}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={prop.image} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{prop.price}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {prop.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('propertiesPage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Properties</button>
          </div>
        </div>
      )}

      {/* FEATURED FRANCHISES GRID */}
      {featuredFranchises.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 20px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Franchises in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Top brand opportunities available for setup.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {featuredFranchises.map((f, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('franchiseDetails', \`?franchiseId=\${f.id}\`)}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={f.logo || f.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=500&q=80'} alt={f.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{f.investmentDisplay}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.brand}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {f.city || currentGlobalCity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('franchisePage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Franchises</button>
          </div>
        </div>
      )}

      {/* FEATURED BUSINESSES GRID */}
      {featuredBusinesses.length > 0 && (
        <div style={{ maxWidth: '1360px', margin: '40px auto 40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Businesses in {currentGlobalCity}</h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', fontWeight: 500 }}>Turnkey operations and commercial businesses for sale.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {featuredBusinesses.map((b, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('businessPage')}
                style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={b.image || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80'} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{b.askingPrice}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <FaMapMarkerAlt /> {b.city || currentGlobalCity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => onNavigate('businessPage')} style={{ padding: '12px 28px', backgroundColor: '#0F172A', color: '#FFF', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>View More Businesses</button>
          </div>
        </div>
      )}

      {/* 5. RECENTLY SOLD PROPERTIES SECTION */}`;

content = content.replace(
  /\{\/\* 5\. RECENTLY SOLD PROPERTIES SECTION \*\/\}/,
  renderSection
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
