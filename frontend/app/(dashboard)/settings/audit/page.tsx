"use client";
import { useState } from "react";
import { Shield, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useGetAuditLogsQuery } from "@/store/api/auditApi";
import { format } from "date-fns";

const ENTITY_TYPES = ["", "appointment", "user", "patient", "doctor", "prescription", "lab_order", "bill", "medical_record", "department"];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-health-100 text-health-700",
  update: "bg-helix-100 text-helix-700",
  delete: "bg-destructive/10 text-destructive",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
  view: "bg-amber-100 text-amber-700",
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action?.toLowerCase().includes(k));
  return key ? ACTION_COLORS[key] : "bg-muted text-muted-foreground";
}

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState("");

  const { data, isLoading, isFetching } = useGetAuditLogsQuery({
    page,
    limit: 25,
    entityType: entityType || undefined,
    userId: userId || undefined,
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-helix-600" /> Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track all system actions and changes</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
          Admin Only
        </span>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-3 items-center shadow-card">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-helix-500"
        >
          <option value="">All Entity Types</option>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 flex-1 min-w-48 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by user ID..."
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <span className="text-xs text-muted-foreground ml-auto">{total.toLocaleString()} entries</span>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Entity</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">IP</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm:ss") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.entityType && (
                        <span className="text-xs">
                          <span className="font-medium">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-muted-foreground"> #{log.entityId.slice(0, 6)}</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {log.userId?.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
