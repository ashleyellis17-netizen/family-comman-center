'use client';

/**
 * Live, shared messaging + quick-request state for the family tablet.
 *
 * Messages are kept in React state and mirrored to localStorage so they
 * persist across navigation and reloads on the shared device. The action
 * signatures are intentionally simple so they can later be backed by the
 * Google Apps Script Web App (see lib/api.ts) without changing the UI.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChatMessage, PersonId, QuickRequestKind, RequestStatus } from './types';
import { seedMessages, getQuickRequestPreset } from './mock-data';

const STORAGE_KEY = 'theveny.messages.v1';
const CURRENT_KEY = 'theveny.currentPerson.v1';

interface MessagesContextValue {
  messages: ChatMessage[];
  currentPerson: PersonId;
  setCurrentPerson: (id: PersonId) => void;
  sendMessage: (to: PersonId, text: string, from?: PersonId) => void;
  sendRequest: (to: PersonId, kind: QuickRequestKind, from?: PersonId) => void;
  respondToRequest: (id: string, status: RequestStatus, reply?: string) => void;
  markThreadRead: (otherPerson: PersonId, viewer?: PersonId) => void;
  threadBetween: (a: PersonId, b: PersonId) => ChatMessage[];
  unreadFor: (person: PersonId) => number;
  unreadFromPerson: (viewer: PersonId, other: PersonId) => number;
  pendingRequestsFor: (person: PersonId) => ChatMessage[];
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [currentPerson, setCurrentPersonState] = useState<PersonId>('mom');
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount (keeps SSR markup deterministic).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      const person = window.localStorage.getItem(CURRENT_KEY) as PersonId | null;
      if (person) setCurrentPersonState(person);
    } catch {
      /* ignore corrupt storage */
    }
    hydrated.current = true;
  }, []);

  // Persist whenever messages change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full / unavailable */
    }
  }, [messages]);

  const setCurrentPerson = useCallback((id: PersonId) => {
    setCurrentPersonState(id);
    try {
      window.localStorage.setItem(CURRENT_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const sendMessage = useCallback(
    (to: PersonId, text: string, from?: PersonId) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          from: from ?? currentPerson,
          to,
          text: trimmed,
          createdAt: new Date().toISOString(),
          read: false,
          kind: 'text',
        },
      ]);
    },
    [currentPerson],
  );

  const sendRequest = useCallback(
    (to: PersonId, kind: QuickRequestKind, from?: PersonId) => {
      const preset = getQuickRequestPreset(kind);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          from: from ?? currentPerson,
          to,
          text: preset?.message ?? 'Request',
          createdAt: new Date().toISOString(),
          read: false,
          kind: 'request',
          request: { kind, status: 'pending' },
        },
      ]);
    },
    [currentPerson],
  );

  const respondToRequest = useCallback(
    (id: string, status: RequestStatus, reply?: string) => {
      setMessages((prev) => {
        const target = prev.find((m) => m.id === id);
        const updated = prev.map((m) =>
          m.id === id && m.request ? { ...m, read: true, request: { ...m.request, status } } : m,
        );
        // Optionally append a reply message back to the requester.
        if (target && reply && reply.trim()) {
          updated.push({
            id: newId(),
            from: target.to,
            to: target.from,
            text: reply.trim(),
            createdAt: new Date().toISOString(),
            read: false,
            kind: 'text',
          });
        }
        return updated;
      });
    },
    [],
  );

  const markThreadRead = useCallback(
    (otherPerson: PersonId, viewer?: PersonId) => {
      const me = viewer ?? currentPerson;
      setMessages((prev) =>
        prev.map((m) => (m.from === otherPerson && m.to === me && !m.read ? { ...m, read: true } : m)),
      );
    },
    [currentPerson],
  );

  const threadBetween = useCallback(
    (a: PersonId, b: PersonId) =>
      messages
        .filter((m) => (m.from === a && m.to === b) || (m.from === b && m.to === a))
        .sort((x, y) => x.createdAt.localeCompare(y.createdAt)),
    [messages],
  );

  const unreadFor = useCallback(
    (person: PersonId) => messages.filter((m) => m.to === person && !m.read).length,
    [messages],
  );

  const unreadFromPerson = useCallback(
    (viewer: PersonId, other: PersonId) =>
      messages.filter((m) => m.to === viewer && m.from === other && !m.read).length,
    [messages],
  );

  const pendingRequestsFor = useCallback(
    (person: PersonId) =>
      messages
        .filter((m) => m.to === person && m.kind === 'request' && m.request?.status === 'pending')
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt)),
    [messages],
  );

  const value = useMemo<MessagesContextValue>(
    () => ({
      messages,
      currentPerson,
      setCurrentPerson,
      sendMessage,
      sendRequest,
      respondToRequest,
      markThreadRead,
      threadBetween,
      unreadFor,
      unreadFromPerson,
      pendingRequestsFor,
    }),
    [
      messages,
      currentPerson,
      setCurrentPerson,
      sendMessage,
      sendRequest,
      respondToRequest,
      markThreadRead,
      threadBetween,
      unreadFor,
      unreadFromPerson,
      pendingRequestsFor,
    ],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within a MessagesProvider');
  return ctx;
}
