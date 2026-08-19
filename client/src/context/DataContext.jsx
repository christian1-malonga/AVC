import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';
import { uid, TODAY } from '../utils/helpers';
import { rolesOf, ROLES } from '../hooks/usePermissions';
import { seedUsers, seedSongs, seedMinutes, seedReceipts, seedVoice, seedDebts, seedDues, genSessions, seedNominations, seedElections, seedAudit, seedPendingUsers, seedRoleHistory, seedDuesSettings, seedAnnouncements, seedDocuments, seedProbations, seedNotifs, seedPendingNoms } from '../data/seed';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState(seedUsers);
  const [songs, setSongs] = useState(seedSongs);
  const [minutes, setMinutes] = useState(seedMinutes);
  const [receipts, setReceipts] = useState(seedReceipts);
  const [voiceNotes, setVoiceNotes] = useState(seedVoice);
  const [sessions, setSessions] = useState(genSessions());
  const [debts, setDebts] = useState(seedDebts);
  const [dues, setDues] = useState(seedDues);
  const [elections, setElections] = useState(seedElections);
  const [nominations, setNominations] = useState(seedNominations);
  const [audit, setAudit] = useState(seedAudit);
  const [pendingUsers, setPendingUsers] = useState(seedPendingUsers);
  const [roleHistory, setRoleHistory] = useState(seedRoleHistory);
  const [duesSettings, setDuesSettings] = useState(seedDuesSettings);
  const [announcements, setAnnouncements] = useState(seedAnnouncements);
  const [documents, setDocuments] = useState(seedDocuments);
  const [probations, setProbations] = useState(seedProbations);
  const [notifs, setNotifs] = useState(seedNotifs);
  const [pendingNoms, setPendingNoms] = useState(seedPendingNoms);
  const [playId, setPlayId] = useState(null);
  const [playProg, setPlayProg] = useState(0);
  const loaded = useRef(false);

  /* keep the signed-in user present in the users mirror */
  useEffect(() => {
    if (!user) return;
    setUsers((prev) => {
      const ex = prev.find((u) => u.email === user.email);
      if (ex) return prev.map((u) => (u.email === user.email ? { ...u, roles: user.roles?.length ? user.roles : u.roles, voice: user.section || u.voice } : u));
      return [...prev, { id: uid('u'), name: user.name, email: user.email, pass: '—', roles: user.roles?.length ? user.roles : ['member'], voice: user.section || 'Alto', joined: TODAY, color: '#1a2c60' }];
    });
  }, [user]);

  const me = users.find((u) => u.email === user?.email) || null;

  /* hydrate from MongoDB once */
  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;
    api.get('/state').then(({ data }) => {
      if (data && data.users?.length) {
        setUsers(data.users); setSongs(data.songs); setMinutes(data.minutes); setReceipts(data.receipts);
        setVoiceNotes(data.voiceNotes); setSessions(data.sessions); setDebts(data.debts); setDues(data.dues);
        setElections(data.elections); setNominations(data.nominations); setAudit(data.audit);
        setPendingUsers(data.pendingUsers); setRoleHistory(data.roleHistory); setDuesSettings(data.duesSettings);
        setAnnouncements(data.announcements); setDocuments(data.documents); setProbations(data.probations);
        setNotifs(data.notifs); setPendingNoms(data.pendingNoms);
      }
    }).catch(() => {});
  }, [user]);

  /* persist (debounced) */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!user) return;
    const t = setTimeout(() => {
      api.put('/state', { users, songs, minutes, receipts, voiceNotes, sessions, debts, dues, elections, nominations, audit, pendingUsers, roleHistory, duesSettings, announcements, documents, probations, notifs, pendingNoms }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [users, songs, minutes, receipts, voiceNotes, sessions, debts, dues, elections, nominations, audit, pendingUsers, roleHistory, duesSettings, announcements, documents, probations, notifs, pendingNoms, user]);

  useEffect(() => { if (!playId) return; const t = setInterval(() => setPlayProg((p) => Math.min(100, p + 1.4)), 100); return () => clearInterval(t); }, [playId]);
  useEffect(() => { if (playProg >= 100) { setPlayId(null); setPlayProg(0); } }, [playProg]);

  const log = (action, detail) => setAudit((p) => [{ id: uid('a'), userId: me?.id || 'u1', role: me ? rolesOf(me).map((r) => ROLES[r].label).join(' + ') : 'System', action, detail, time: new Date().toISOString().slice(0, 16).replace('T', ' ') }, ...p]);
  const notify = (text) => setNotifs((p) => [{ id: uid('n'), text, date: TODAY, readBy: [] }, ...p]);
  const togglePlay = (id) => { if (playId === id) { setPlayId(null); setPlayProg(0); } else { setPlayId(id); setPlayProg(0); } };

  const value = { me, users, setUsers, songs, setSongs, minutes, setMinutes, receipts, setReceipts, voiceNotes, setVoiceNotes, sessions, setSessions, debts, setDebts, dues, setDues, elections, setElections, nominations, setNominations, audit, log, toast, playId, playProg, togglePlay, pendingUsers, setPendingUsers, roleHistory, setRoleHistory, duesSettings, setDuesSettings, announcements, setAnnouncements, documents, setDocuments, probations, setProbations, notifs, setNotifs, pendingNoms, setPendingNoms, notify };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
export const useDataContext = () => useContext(DataContext);