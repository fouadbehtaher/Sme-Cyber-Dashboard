import React from 'react';
import './dashboard.css';

const SecurityScore = ({ score = 80 }) => {
	return (
		<div className="card">
			<h3 style={{ color: '#888', marginBottom: '8px' }}>معدل الأمان</h3>
			<div style={{ fontSize: '2rem', color: score > 70 ? 'green' : score > 40 ? 'orange' : 'red' }}>{score}</div>
		</div>
	);
};

export default SecurityScore;
