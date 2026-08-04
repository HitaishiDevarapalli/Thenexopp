const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// The JSX was appended, but the arrays weren't!
// Let's insert them right before "return (" inside the component.

// We can just find "return (" that is right after the featuredListings map.
// Let's use a simpler string replace.

const insertion = `
  const featuredFranchises = franchiseDb
    .filter(f => (f.city || '').toLowerCase() === currentGlobalCity.toLowerCase() || (f.location || '').toLowerCase().includes(currentGlobalCity.toLowerCase()))
    .slice(0, 4);

  const featuredBusinesses = businessDb
    .filter(b => (b.city || '').toLowerCase() === currentGlobalCity.toLowerCase() || (b.location || '').toLowerCase().includes(currentGlobalCity.toLowerCase()))
    .slice(0, 4);

  return (`;

content = content.replace("  });\r\n\r\n  return (", "  });\n\n" + insertion);
// fallback for \n
content = content.replace("  });\n\n  return (", "  });\n\n" + insertion);

fs.writeFileSync('src/pages/HomePage.tsx', content);
