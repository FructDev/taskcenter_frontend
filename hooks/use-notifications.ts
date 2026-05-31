"use client";
import useSWR from "swr";
import { NotificationType } from "@/types";
import { fetcher } from "@/lib/fetcher";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<NotificationType[]>(
    "/notifications/my",
    fetcher
  );

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, isLoading, mutate };
}
