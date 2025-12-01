import React from 'react';
import './ReviewOverview.css';

interface Review {
  aiSentimentLabel?: string;
  // ...
}

interface Props {
  reviews: Review[];
}

const ReviewOverview: React.FC<Props> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const total = reviews.length;
  const posCount = reviews.filter(r => r.aiSentimentLabel === 'LABEL_2' || r.aiSentimentLabel === 'POS').length;
  const negCount = reviews.filter(r => r.aiSentimentLabel === 'LABEL_0' || r.aiSentimentLabel === 'NEG').length;
  const neuCount = reviews.filter(r => r.aiSentimentLabel === 'LABEL_1' || r.aiSentimentLabel === 'NEU').length;

  const posPercent = Math.round((posCount / total) * 100);
  const negPercent = Math.round((negCount / total) * 100);
  const neuPercent = Math.round((neuCount / total) * 100);

  // Xác định Cảm xúc chủ đạo
  let dominantEmoji = "🤔";
  let dominantText = "Bình thường";
  let dominantClass = "neu";
  let summaryText = "Các đánh giá khá cân bằng.";

  if (posPercent >= neuPercent && posPercent >= negPercent) {
    dominantEmoji = "😍";
    dominantText = "Rất Hài Lòng";
    dominantClass = "pos";
    summaryText = "Đa số thực khách đều có trải nghiệm tuyệt vời tại đây!";
  } else if (negPercent >= posPercent && negPercent >= neuPercent) {
    dominantEmoji = "😤";
    dominantText = "Không Hài Lòng";
    dominantClass = "neg";
    summaryText = "Quán nhận được nhiều phản hồi tiêu cực, cần cân nhắc.";
  }

  // Tính toán vòng tròn
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (posPercent / 100) * circumference;

  return (
    <div className="review-overview-card">
      <div className="card-bg-glow"></div>
      
      <div className="overview-header">
        <h3>✨ AI Sentiment Analytics</h3>
        <span className="ai-badge">LIVE UPDATE</span>
      </div>

      <div className="dashboard-grid">
        {/* CỘT TRÁI: CHART */}
        <div className="chart-column">
            <div className="circular-chart">
                <svg viewBox="0 0 100 100" className="circle-svg">
                    <circle className="circle-bg" cx="50" cy="50" r={radius} />
                    <circle 
                        className={`circle-progress ${dominantClass}`} 
                        cx="50" cy="50" r={radius} 
                        style={{ strokeDasharray: circumference, strokeDashoffset }}
                    />
                </svg>
                <div className="circle-content">
                    <span className="big-percent">{posPercent}%</span>
                    <span className="label-text">Hài lòng</span>
                </div>
            </div>
            
            <div className={`dominant-badge ${dominantClass}`}>
                <span className="emoji">{dominantEmoji}</span>
                <span className="text">{dominantText}</span>
            </div>
        </div>

        {/* CỘT PHẢI: DETAILS */}
        <div className="details-column">
            <div className="summary-bubble">
                <p>"{summaryText}"</p>
            </div>

            <div className="sentiment-bars-compact">
                {/* Tích cực */}
                <div className="bar-item">
                    <div className="bar-header">
                        <span className="b-label">😊 Tích cực</span>
                        <span className="b-val pos">{posCount} ({posPercent}%)</span>
                    </div>
                    <div className="track">
                        <div className="fill pos" style={{ width: `${posPercent}%` }}>
                            {/* [MỚI] Thêm Shimmer vào đây */}
                            <div className="shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Trung tính */}
                <div className="bar-item">
                    <div className="bar-header">
                        <span className="b-label">😐 Trung tính</span>
                        <span className="b-val neu">{neuCount} ({neuPercent}%)</span>
                    </div>
                    <div className="track">
                        <div className="fill neu" style={{ width: `${neuPercent}%` }}>
                            {/* [MỚI] Thêm Shimmer vào đây */}
                            <div className="shimmer"></div>
                        </div>
                    </div>
                </div>

                {/* Tiêu cực */}
                <div className="bar-item">
                    <div className="bar-header">
                        <span className="b-label">😡 Tiêu cực</span>
                        <span className="b-val neg">{negCount} ({negPercent}%)</span>
                    </div>
                    <div className="track">
                        <div className="fill neg" style={{ width: `${negPercent}%` }}>
                             {/* [MỚI] Thêm Shimmer vào đây */}
                            <div className="shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOverview;