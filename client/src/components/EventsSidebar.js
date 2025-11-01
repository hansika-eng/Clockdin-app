import React from 'react';

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString();
  } catch { return 'TBD'; }
};

const EVENTS_MAP = {
  all: '',
  hackathon: 'Hackathon',
  internship: 'Internship',
  workshop: 'Workshop',
  competition: 'Competition',
  seminar: 'Seminar'
};

const EventsSidebar = ({ events = [], onSelectCategory = () => {}, onOpenEvent = () => {}, activeCategory = 'all' }) => {
  const now = new Date();
  const upcoming = events
    .filter(e => e.eventDate && new Date(e.eventDate) >= now)
    .sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate));

  const byType = {};
  Object.keys(EVENTS_MAP).forEach(k => byType[k] = []);
  upcoming.forEach(ev => {
    const key = (ev.type || '').toLowerCase();
    if (key && byType[key]) byType[key].push(ev);
    else byType['all'].push(ev);
    // ensure also in 'all'
    if (!byType['all'].includes(ev)) byType['all'].push(ev);
  });

  // helper to render a short list (max 6)
  const renderList = (list) => (
    <ul className="sidebar-list">
      {list.slice(0,6).map(ev => (
        <li key={ev._id} className="sidebar-item" onClick={() => onOpenEvent(ev)}>
          <div className="sb-title">{ev.title}</div>
          <div className="sb-meta">{formatDate(ev.eventDate)} • {ev.location ? ev.location.split(',')[0] : 'Online'}</div>
        </li>
      ))}
      {list.length === 0 && <li className="sidebar-empty">No upcoming</li>}
    </ul>
  );

  return (
    <aside className="events-sidebar">
      <div className="sidebar-inner">
        <h5 className="sidebar-heading">Upcoming Events</h5>

        <div className="sidebar-cats">
          {Object.entries(EVENTS_MAP).map(([key, label]) => (
            <button
              key={key}
              className={`sidebar-cat-btn ${activeCategory===key ? 'active' : ''}`}
              onClick={() => onSelectCategory(key)}
            >
              {key === 'all' ? 'All Events' : label + (label ? 's' : '')}
              <span className="count-pill">{(byType[key] || []).length}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Next — All</div>
          {renderList(byType['all'])}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Hackathons</div>
          {renderList(byType['hackathon'])}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Internships</div>
          {renderList(byType['internship'])}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Workshops</div>
          {renderList(byType['workshop'])}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Competitions</div>
          {renderList(byType['competition'])}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Seminars</div>
          {renderList(byType['seminar'])}
        </div>

        <div style={{marginTop:12, textAlign:'center'}}>
          <a href="#all-events" onClick={(e)=>{e.preventDefault(); onSelectCategory('all');}} className="btn btn-sm btn-outline-primary">View all upcoming</a>
        </div>
      </div>
    </aside>
  );
};

export default EventsSidebar;