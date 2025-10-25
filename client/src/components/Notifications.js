
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Events.css';

const typeIcons = {
  deadline: 'bi-exclamation-triangle',
  reminder: 'bi-clock',
  info: 'bi-info-circle',
  bookmark: 'bi-bookmark',
};

const NotificationSettings = ({ settings, onChange }) => (
  <div className="p-4" style={{background:'#fff', borderRadius:'1.2rem', border:'1.5px solid #e5e7eb', minWidth:320}}>
    <h3 style={{fontWeight:800, fontSize:'1.5rem', color:'#22223b', marginBottom:'1.2rem'}}>Notification Settings</h3>
    <div className="form-check form-switch mb-3">
      <input className="form-check-input" type="checkbox" checked={settings.email} onChange={()=>onChange('email')} id="emailSwitch" />
      <label className="form-check-label" htmlFor="emailSwitch">Email Notifications</label>
      <div className="text-muted" style={{fontSize:'0.98rem'}}>Receive notifications via email</div>
    </div>
    <div className="form-check form-switch mb-3">
      <input className="form-check-input" type="checkbox" checked={settings.deadline} onChange={()=>onChange('deadline')} id="deadlineSwitch" />
      <label className="form-check-label" htmlFor="deadlineSwitch">Event Deadline Alerts</label>
      <div className="text-muted" style={{fontSize:'0.98rem'}}>Alert me 3 days before deadlines</div>
    </div>
    <div className="form-check form-switch mb-3">
      <input className="form-check-input" type="checkbox" checked={settings.reminder} onChange={()=>onChange('reminder')} id="reminderSwitch" />
      <label className="form-check-label" htmlFor="reminderSwitch">Personal Reminders</label>
      <div className="text-muted" style={{fontSize:'0.98rem'}}>Reminders for my personal events</div>
    </div>
    <div className="form-check form-switch mb-1">
      <input className="form-check-input" type="checkbox" checked={settings.push} onChange={()=>onChange('push')} id="pushSwitch" />
      <label className="form-check-label" htmlFor="pushSwitch">Push Notifications</label>
      <div className="text-muted" style={{fontSize:'0.98rem'}}>Browser push notifications</div>
    </div>
  </div>
);


const Notifications = () => {
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('all');
  const [settings, setSettings] = useState({
    email: true,
    deadline: true,
    reminder: true,
    push: false,
  });

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
  const token = localStorage.getItem('clockdin_token');
        const res = await axios.get('/api/users/notifications', {
          headers: { 'x-auth-token': token }
        });
        setNotifications(res.data);
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, []);


  // Tab filtering
  const filtered = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.read;
    if (tab === 'deadlines') return n.type === 'deadline';
    if (tab === 'reminders') return n.type === 'reminder';
    return true;
  });

  // Actions
  const markAllRead = () => setNotifications(notifications.map(n => ({...n, read:true})));
  const clearAll = () => setNotifications([]);
  const markAsRead = id => setNotifications(notifications.map(n => n.id === id ? {...n, read:true} : n));
  const deleteNotif = id => setNotifications(notifications.filter(n => n.id !== id));
  const handleSettings = key => setSettings(s => ({...s, [key]:!s[key]}));

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div>
          <h1 style={{fontWeight:900, fontSize:'2.7rem', color:'#22223b', marginBottom:0, letterSpacing:'-1px', display:'flex', alignItems:'center', gap:'0.7rem'}}>
            <i className="bi bi-bell-fill" style={{color:'#3b5bfd', fontSize:'2.2rem', marginRight:'0.2rem'}}></i>
            Notifications
            <span className="badge bg-danger ms-2" style={{fontSize:'1.25rem', verticalAlign:'top', fontWeight:700, borderRadius:'1.2rem', padding:'0.4em 0.9em'}}>{notifications.filter(n=>!n.read).length}</span>
          </h1>
          <div style={{color:'#64748b', fontSize:'1.18rem', marginTop:'0.2rem'}}>Stay updated with event deadlines and personal reminders</div>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={()=>alert('Test notification!')}><i className="bi bi-bell"></i>Test Notifications</button>
          <button className="btn btn-outline-success d-flex align-items-center gap-2" onClick={markAllRead}><i className="bi bi-check2-all"></i>Mark All Read</button>
          <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={clearAll}><i className="bi bi-trash"></i>Clear All</button>
        </div>
      </div>
      <div className="d-flex gap-4 mt-4">
        <div style={{flex:1}}>
          <div className="d-flex gap-2 mb-3">
            <button className={`btn ${tab==='all'?'btn-light border border-primary shadow-sm':'btn-light border'}`} onClick={()=>setTab('all')}><i className="bi bi-inbox me-1"></i>All ({notifications.length})</button>
            <button className={`btn ${tab==='unread'?'btn-light border border-primary shadow-sm':'btn-light border'}`} onClick={()=>setTab('unread')}><i className="bi bi-envelope-open me-1"></i>Unread ({notifications.filter(n=>!n.read).length})</button>
            <button className={`btn ${tab==='deadlines'?'btn-light border border-primary shadow-sm':'btn-light border'}`} onClick={()=>setTab('deadlines')}><i className="bi bi-exclamation-triangle me-1"></i>Deadlines</button>
            <button className={`btn ${tab==='reminders'?'btn-light border border-primary shadow-sm':'btn-light border'}`} onClick={()=>setTab('reminders')}><i className="bi bi-clock me-1"></i>Reminders</button>
          </div>
          {filtered.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{background:'#fff', borderRadius:'1.2rem', minHeight:'220px', border:'1.5px solid #e5e7eb'}}>
              <i className="bi bi-bell" style={{fontSize:'4.5rem', color:'#cbd5e1', marginBottom:'1rem'}}></i>
              <div style={{fontWeight:800, fontSize:'1.5rem', color:'#22223b'}}>No notifications</div>
            </div>
          ) : (
            filtered.map(n => (
              <div key={n.id} className="d-flex align-items-start gap-3 mb-3 p-4" style={{background:'#fff', borderRadius:'1.2rem', borderLeft:`5px solid ${n.type==='deadline'?'#3b5bfd':'#fab005'}`, border:'1.5px solid #e5e7eb', boxShadow:'0 4px 16px rgba(80,80,120,0.07)'}}>
                <div style={{fontSize:'2.3rem', color:n.type==='deadline'?'#fab005':'#3b5bfd', marginTop:'0.2rem'}}>
                  <i className={`bi ${typeIcons[n.type] || 'bi-bell'}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div style={{fontWeight:800, fontSize:'1.18rem', color:'#22223b', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    {n.title} {!n.read && <span style={{color:'#3b5bfd', fontSize:'1.3rem'}}>•</span>}
                  </div>
                  <div style={{color:'#495057', fontSize:'1.12rem', whiteSpace:'pre-line', marginTop:'0.2rem'}}>{n.message}</div>
                  <div className="d-flex gap-2 align-items-center mt-2" style={{fontSize:'1.01rem', color:'#868e96'}}>
                    <span><i className="bi bi-clock me-1"></i>{n.date ? new Date(n.date).toLocaleString() : ''}</span>
                    {n.tag && <span className="badge bg-light border text-dark" style={{fontWeight:700, textTransform:'capitalize', fontSize:'1rem'}}>{n.tag}</span>}
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 align-items-end">
                  {!n.read && <button className="btn btn-link text-success p-0" title="Mark as read" onClick={()=>markAsRead(n.id)}><i className="bi bi-check2-circle" style={{fontSize:'1.5rem'}}></i></button>}
                  <button className="btn btn-link text-danger p-0" title="Delete" onClick={()=>deleteNotif(n.id)}><i className="bi bi-trash" style={{fontSize:'1.5rem'}}></i></button>
                </div>
              </div>
            ))
          )}
        </div>
        <NotificationSettings settings={settings} onChange={handleSettings} />
      </div>
    </div>
  );
};

export default Notifications;
