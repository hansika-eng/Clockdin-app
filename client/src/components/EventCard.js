import React, { useState } from 'react';

const EventCard = ({ event, onBookmark, isBookmarked, showBookmark = false, onClick }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <div className="event-card card h-100 p-0 border-0" style={{cursor: 'pointer'}} onClick={onClick}>
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center mb-2 justify-content-between">
            <div className="d-flex align-items-center">
              <span className="event-badge me-2">{event.type}</span>
              {event.difficulty && (
                <span className={`difficulty-badge ${event.difficulty.toLowerCase()}`}>
                  {event.difficulty}
                </span>
              )}
            </div>
            {showBookmark && (
              <button
                className="btn btn-link p-0 border-0"
                style={{boxShadow:'none'}}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                onClick={e => { e.stopPropagation(); onBookmark(event); }}
              >
                <i className={isBookmarked ? 'bi bi-bookmark-fill text-primary' : 'bi bi-bookmark'} style={{fontSize:'1.4em'}}></i>
              </button>
            )}
          </div>
          <h5 className="card-title fw-bold mb-1" style={{color:'#3b5bfd'}}>{event.title}</h5>
          <p className="card-text mb-2" style={{minHeight:'60px'}}>{event.description}</p>
          
          {/* Basic Info */}
          <div className="event-meta-list mb-2">
            <div className="event-meta d-flex align-items-center mb-1">
              <i className="bi bi-geo-alt me-2"></i>
              <span>{event.location}</span>
            </div>
            <div className="event-meta d-flex align-items-center mb-1">
              <i className="bi bi-calendar-event me-2"></i>
              <span><strong>Event:</strong> {event.eventDate ? new Date(event.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
            </div>
            <div className="event-meta d-flex align-items-center mb-1">
              <i className="bi bi-clock me-2"></i>
              <span><strong>Deadline:</strong> {event.deadline ? new Date(event.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
            </div>
            {event.duration && (
              <div className="event-meta d-flex align-items-center mb-1">
                <i className="bi bi-hourglass-split me-2"></i>
                <span><strong>Duration:</strong> {event.duration}</span>
              </div>
            )}
            {event.mode && (
              <div className="event-meta d-flex align-items-center mb-1">
                <i className="bi bi-laptop me-2"></i>
                <span><strong>Mode:</strong> {event.mode}</span>
              </div>
            )}
          </div>

          {/* Detailed Information (Expandable) */}
          {showDetails && (
            <div className="event-details mb-3">
              <div className="details-section">
                <h6 className="details-title">📋 Eligibility</h6>
                <p className="details-content">{event.eligibility}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">👥 Team/Individual</h6>
                <p className="details-content">{event.teamOrIndividual}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">🎁 Stipend & Perks</h6>
                <p className="details-content">{event.stipendPerks}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">🏢 Organizer</h6>
                <p className="details-content">{event.organizerReputation}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">📚 Learning Opportunities</h6>
                <p className="details-content">{event.learningOpportunities}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">🎯 Future Scope</h6>
                <p className="details-content">{event.futureScope}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">👥 Networking</h6>
                <p className="details-content">{event.networking}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">📊 Applicants (2024)</h6>
                <p className="details-content">{event.applicants}</p>
              </div>
              
              <div className="details-section">
                <h6 className="details-title">💬 Past Reviews</h6>
                <p className="details-content review-text">{event.pastReviews}</p>
              </div>
            </div>
          )}

          <div className="event-tags mb-2">
            {event.tags && event.tags.map((tag, idx) => (
              <span key={idx} className="event-tag">{tag}</span>
            ))}
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary flex-fill"
            onClick={toggleDetails}
            style={{fontWeight:600, fontSize:'0.9rem'}}
          >
            <i className={`bi ${showDetails ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
            {showDetails ? 'Less Details' : 'More Details'}
          </button>
          <a
            href={event.applyLink || event.link || '#'}
            className="btn btn-primary flex-fill"
            target="_blank"
            rel="noopener noreferrer"
            style={{fontWeight:600, fontSize:'0.9rem'}}
            onClick={e => e.stopPropagation()}
          >
            Apply Now <i className="bi bi-box-arrow-up-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
