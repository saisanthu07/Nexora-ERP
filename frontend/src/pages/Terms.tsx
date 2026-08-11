import React from 'react';

export function Terms() {
  return (
    <div className="desk" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
      <h1 className="page-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Terms and Conditions</h1>
      
      <div className="paper-card" style={{ marginTop: '24px' }}>
        <h2>1. Introduction</h2>
        <p>Welcome to Nexora ERP. These Terms and Conditions govern your use of our application and services. By accessing or using Nexora ERP, you agree to be bound by these Terms.</p>
        
        <h2>2. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the application for any illegal or unauthorized purpose.</p>
        
        <h2>3. Intellectual Property</h2>
        <p>The application, including its original content, features, and functionality, is owned by Nexora ERP and is protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
        
        <h2>4. Limitation of Liability</h2>
        <p>In no event shall Nexora ERP, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the application.</p>
        
        <h2>5. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes. By continuing to access or use our application after those revisions become effective, you agree to be bound by the revised terms.</p>
        
        <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>Last updated: August 2026</p>
      </div>
    </div>
  );
}
