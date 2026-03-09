import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";


export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);


  //

  <button
  className="btn btn-outline-secondary"
  onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }}
>
  Logout
</button>
  // Add form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  // Search
  const [query, setQuery] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/employees");
      setEmployees(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      const hay = `${e.firstName || ""} ${e.lastName || ""} ${e.email || ""} ${e.position || ""} ${e.department || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [employees, query]);

  const addEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/employees", {
        firstName,
        lastName,
        email,
        position,
        department,
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPosition("");
      setDepartment("");

      toast.success("Employee added.");
      await loadEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add employee.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (emp) => {
    setEditingId(emp._id);
    setEditFirstName(emp.firstName || "");
    setEditLastName(emp.lastName || "");
    setEditEmail(emp.email || "");
    setEditPosition(emp.position || "");
    setEditDepartment(emp.department || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditPosition("");
    setEditDepartment("");
  };

  const updateEmployee = async (id) => {
    setLoading(true);
    try {
      await api.put(`/api/employees/${id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        position: editPosition,
        department: editDepartment,
      });

      toast.success("Employee updated.");
      cancelEdit();
      await loadEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    setLoading(true);
    try {
      await api.delete(`/api/employees/${id}`);
      toast.success("Employee deleted.");
      await loadEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
        <div>
          <h3 className="mb-1">Employees</h3>
          <div className="text-muted small">Create • Read • Update • Delete (JWT Protected)</div>
        </div>

        <div style={{ minWidth: 280 }}>
          <label className="form-label small text-muted mb-1">Search</label>
          <input
            className="form-control"
            placeholder="Search name, email, position..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Add Employee</h5>

          <form onSubmit={addEmployee} className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="First name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Last name *" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} disabled={loading} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={loading} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? "Working..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="card-title mb-0">Employee List</h5>
            <span className="badge text-bg-secondary">{filteredEmployees.length}</span>
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="text-muted mb-0">No employees found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 280 }}>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th style={{ width: 200 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        {editingId === emp._id ? (
                          <div className="d-flex gap-2">
                            <input className="form-control form-control-sm" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} disabled={loading} />
                            <input className="form-control form-control-sm" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} disabled={loading} />
                          </div>
                        ) : (
                          <>
                            {emp.firstName} {emp.lastName}
                          </>
                        )}
                      </td>

                      <td>
                        {editingId === emp._id ? (
                          <input className="form-control form-control-sm" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} disabled={loading} />
                        ) : (
                          emp.email || "-"
                        )}
                      </td>

                      <td>
                        {editingId === emp._id ? (
                          <input className="form-control form-control-sm" value={editPosition} onChange={(e) => setEditPosition(e.target.value)} disabled={loading} />
                        ) : (
                          emp.position || "-"
                        )}
                      </td>

                      <td>
                        {editingId === emp._id ? (
                          <input className="form-control form-control-sm" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} disabled={loading} />
                        ) : (
                          emp.department || "-"
                        )}
                      </td>

                      <td>
                        {editingId === emp._id ? (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => updateEmployee(emp._id)} disabled={loading}>
                              Save
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={cancelEdit} disabled={loading}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(emp)} disabled={loading}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteEmployee(emp._id)} disabled={loading}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            
          <div className="text-muted small mt-3">
            Tip: Use the search box to quickly find employees by name, email, position, or department.
          </div>
        </div>
      </div>
    </div>
  );
}