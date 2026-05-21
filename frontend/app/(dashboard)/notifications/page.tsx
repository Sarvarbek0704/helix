"use client";
import { useGetAllQuery, useMarkReadMutation, useMarkAllReadMutation, useDeleteNotificationMutation } from "@/store/api/notificationsApi";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function NotificationsPage() {
  const { data, isLoading } = useGetAllQuery({});
  const notifications = data?.data || [];
  const unread = notifications.filter((n: any) => !n.isRead).length;

  const [markRead] = useMarkReadMutation();
  const [markAll] = useMarkAllReadMutation();
  const [del] = useDeleteNotificationMutation();

  async function handleMarkRead(id: string) {
    try { await markRead(id).unwrap(); } catch { toast.error("Failed to mark as read"); }
  }
  async function handleMarkAll() {
    try { await markAll().unwrap(); toast.success("All marked as read"); } catch { toast.error("Failed"); }
  }
  async function handleDelete(id: string) {
    try { await del(id).unwrap(); } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{unread} unread</p>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-sm text-helix-600 hover:underline">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={clsx(
                "group flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer",
                n.isRead ? "bg-card" : "bg-helix-50/50 border-helix-200 dark:bg-helix-900/10 dark:border-helix-800"
              )}>
              <div className={clsx("w-2 h-2 rounded-full shrink-0 mt-2", n.isRead ? "bg-muted" : "bg-helix-500")} />
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
