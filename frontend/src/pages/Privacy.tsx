import React from 'react';

export function Privacy() {
  return (
    <div className="desk" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <h1 className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Privacy Policy</h1>
      
      <div className="paper-card" style={{ marginTop: '24px' }}>
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you create an account, update your profile, or use our services. This may include your name, email address, phone number, and other contact or identifying information.</p>
        
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate, maintain, and improve our application. We may also use your information to communicate with you, provide customer support, and send administrative messages.</p>
        
        <h2>3. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no internet transmission is completely secure, and we cannot guarantee the absolute security of your data.</p>
        
        <h2>4. Data Sharing</h2>
        <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners, trusted affiliates, and advertisers.</p>
        
        <h2>5. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal data, such as the right to access, correct, or delete your data. To exercise these rights, please contact our support team.</p>
        
        <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>Last updated: August 2026</p>
      </div>
    </div>
  );
}
