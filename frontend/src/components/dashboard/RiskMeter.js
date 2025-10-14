import React from 'react';
import './dashboard.css';

const RiskMeter = ({ risk = 'منخفض' }) => {
	return (
		<div className="card">
			<h3 style={{ color: '#888', marginBottom: '8px' }}>مؤشر المخاطر</h3>
			<div style={{ fontSize: '2rem', color: risk === 'مرتفع' ? 'red' : 'green' }}>{risk}</div>
		</div>
	);
};

export default RiskMeter;
