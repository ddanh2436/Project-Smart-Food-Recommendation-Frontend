import React from 'react';

interface SentimentBadgeProps {
  label: string; // LABEL_0, LABEL_1, hoặc LABEL_2
  score?: number; // Độ tin cậy (optional)
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ label, score }) => {
  let config = {
    text: 'Trung tính',
    color: '#6c757d', // Xám
    bgColor: '#e2e3e5',
    icon: '😐'
  };

  // Dựa trên logic trong file test_sentiment.py của bạn
  if (label === 'LABEL_2' || label === 'POS') {
    config = {
      text: 'Tích cực',
      color: '#155724', // Xanh lá đậm
      bgColor: '#d4edda', // Xanh lá nhạt
      icon: '😊'
    };
  } else if (label === 'LABEL_0' || label === 'NEG') {
    config = {
      text: 'Tiêu cực',
      color: '#721c24', // Đỏ đậm
      bgColor: '#f8d7da', // Đỏ nhạt
      icon: '😞'
    };
  }

  // Nếu không có label (data cũ chưa chạy AI), không render gì cả
  if (!label) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '12px',
      backgroundColor: config.bgColor,
      color: config.color,
      fontSize: '12px',
      fontWeight: 600,
      marginLeft: '10px', // Cách ra khỏi ngôi sao một chút
      border: `1px solid ${config.color}20` // Viền mờ
    }}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {/* Nếu muốn hiện độ tin cậy thì bỏ comment dòng dưới */}
      {/* {score && <span style={{opacity: 0.7, fontSize: '10px'}}>({Math.round(score * 100)}%)</span>} */}
    </span>
  );
};

export default SentimentBadge;