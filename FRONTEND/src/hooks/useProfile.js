import { useState, useRef, useEffect, useCallback } from 'react';

export default function useProfile(user) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const profileRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line
    setEditForm(user);
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setEditMode(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const saveProfile = useCallback(() => {
    setEditForm(editForm);
    setEditMode(false);
  }, [editForm]);

  return {
    profileOpen, setProfileOpen,
    editMode, setEditMode,
    editForm, setEditForm,
    saveProfile,
    profileRef,
  };
}