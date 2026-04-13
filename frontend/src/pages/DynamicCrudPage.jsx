import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function DynamicCrudPage() {
  const { modelName } = useParams();

  const [models, setModels] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const modelConfig = models[modelName];

  const fields = useMemo(() => {
    return modelConfig?.fields || {};
  }, [modelConfig]);

  const loadPageData = async () => {
    setLoading(true);
    setMsg("");

    try {
      const [modelsRes, recordsRes] = await Promise.all([
        api.get("/api/dynamic/models"),
        api.get(`/api/dynamic/${modelName}`),
      ]);

      setModels(modelsRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to load dynamic CRUD page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [modelName]);

  const handleInputChange = (fieldName, value, type) => {
    let parsedValue = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: parsedValue,
    }));
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setFormData(record.data || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      if (editingId) {
        await api.put(`/api/dynamic/${modelName}/${editingId}`, formData);
      } else {
        await api.post(`/api/dynamic/${modelName}`, formData);
      }

      resetForm();
      await loadPageData();
    } catch (err) {
      const errorData = err?.response?.data;
      if (errorData?.errors?.length) {
        setMsg(errorData.errors.join(" "));
      } else {
        setMsg(errorData?.message || "Operation failed.");
      }
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Soft delete this record?");
    if (!ok) return;

    setMsg("");

    try {
      await api.delete(`/api/dynamic/${modelName}/${id}`);
      await loadPageData();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1100 }}>
        <div className="alert alert-light">Loading...</div>
      </div>
    );
  }

  if (!modelConfig) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1100 }}>
        <div className="alert alert-danger">Model not found.</div>
        <Link to="/dynamic" className="btn btn-secondary">
          Back to Models
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">{modelConfig.label}</h2>
          <p className="text-muted mb-0">
            Dynamic CRUD management for <strong>{modelName}</strong>
          </p>
        </div>

        <Link to="/dynamic" className="btn btn-outline-secondary">
          Back to Models
        </Link>
      </div>

      {msg && <div className="alert alert-warning">{msg}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            {editingId ? "Edit Record" : "Create Record"}
          </h5>

          <form onSubmit={handleSubmit} className="row g-3">
            {Object.entries(fields).map(([fieldName, fieldConfig]) => (
              <div className="col-md-6" key={fieldName}>
                <label className="form-label">
                  {fieldName}
                  {fieldConfig.required ? " *" : ""}
                </label>

                <input
                  type={
                    fieldConfig.type === "number"
                      ? "number"
                      : fieldConfig.type === "date"
                      ? "date"
                      : "text"
                  }
                  className="form-control"
                  value={formData[fieldName] ?? ""}
                  onChange={(e) =>
                    handleInputChange(fieldName, e.target.value, fieldConfig.type)
                  }
                  required={fieldConfig.required}
                />
              </div>
            ))}

            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update" : "Create"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Records</h5>

          {records.length === 0 ? (
            <div className="alert alert-light mb-0">No records found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    {Object.keys(fields).map((fieldName) => (
                      <th key={fieldName}>{fieldName}</th>
                    ))}
                    <th style={{ width: 180 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      {Object.keys(fields).map((fieldName) => (
                        <td key={fieldName}>
                          {String(record.data?.[fieldName] ?? "")}
                        </td>
                      ))}

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(record)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(record._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}