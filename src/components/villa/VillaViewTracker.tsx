"use client";

import { useEffect, useRef } from "react";

function getVisitorId() {
  const key = "rentvilla_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function VillaViewTracker({ villaId }: { villaId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    const sessionKey = `rentvilla_view_${villaId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    tracked.current = true;
    sessionStorage.setItem(sessionKey, "1");

    fetch(`/api/villas/${villaId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    }).catch(() => {});
  }, [villaId]);

  return null;
}
