"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useNotifications } from "@/hooks/use-notifications";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationType } from "@/types";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, mutate } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await api.patch("/notifications/read-all");
    mutate();
  };

  const handleItemClick = async (notification: NotificationType) => {
    if (!notification.isRead) {
      await api.patch(`/notifications/${notification._id}/read`);
      mutate();
    }
    if (notification.taskId) {
      router.push(`/tasks/${notification.taskId}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm">Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tienes notificaciones
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleItemClick(notification)}
                className={cn(
                  "flex gap-3 px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-2",
                  notification.isRead
                    ? "border-l-transparent"
                    : "border-l-primary bg-muted/20"
                )}
              >
                {!notification.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
                <div
                  className={cn(
                    "flex flex-col gap-0.5",
                    notification.isRead && "pl-5"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm leading-tight",
                      !notification.isRead && "font-semibold"
                    )}
                  >
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      locale: es,
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
