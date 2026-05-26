"use client";
import { useState } from "react";
import { useGetUsersQuery, useSuspendMutation, useActivateMutation, useDeleteUserMutation } from "@/store/api/usersApi";
import { Search, Users, ShieldOff, ShieldCheck, Trash2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-helix-100 text-helix-700",
  nurse: "bg-health-100 text-health-700",
  patient: "bg-amber-100 text-amber-700",
  lab_tech: "bg-blue-100 text-blue-700",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  });

  const [suspend] = useSuspendMutation();
  const [activate] = useActivateMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.data || [];

  async function handleSuspend(id: string) {
    try { await suspend(id).unwrap(); toast.success("User suspended"); }
    catch { toast.error("Failed to suspend user"); }
  }

  async function handleActivate(id: string) {
    try { await activate(id).unwrap(); toast.success("User activated"); }
    catch { toast.error("Failed to activate user"); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted");
      setConfirmDelete(null);
    } catch { toast.error("Failed to delete user"); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-helix-500" />
        </div>
        <div className="flex gap-1.5">
          {["all", "admin", "doctor", "nurse", "patient", "lab_tech"].map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${role === r ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {r.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all", "active", "suspended"].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${status === s ? "bg-helix-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{data?.total || 0} users found</p>

      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id} className={`hover:bg-muted/30 transition ${isFetching ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-helix-100 flex items-center justify-center text-helix-700 text-xs font-bold shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="text-sm font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_COLORS[u.role] || "bg-muted text-muted-foreground"}`}>
                      {u.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                    {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-health-100 text-health-700" : "bg-destructive/10 text-destructive"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === "active" ? (
                        <button onClick={() => handleSuspend(u.id)} title="Suspend"
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition">
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(u.id)} title="Activate"
                          className="p-1.5 rounded-lg hover:bg-health-50 text-muted-foreground hover:text-health-600 transition">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(u.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(data.totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === i + 1 ? "bg-helix-600 text-white" : "bg-muted hover:bg-muted/80"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Delete user?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
