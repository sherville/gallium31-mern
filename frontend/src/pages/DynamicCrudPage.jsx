import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function DynamicCrudPage() {
  const { modelName } = useParams();

  const [models, setModels] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      setModels(modelsRes.data.data || {});
setRecords(recordsRes.data.data || []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to load page.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/api/dynamic/${modelName}/${editingId}`, formData);
        setSuccessMsg("Record updated successfully.");
      } else {
        await api.post(`/api/dynamic/${modelName}`, formData);
        setSuccessMsg("Record created successfully.");
      }

      resetForm();
      await loadPageData();
    } catch (err) {
      const errorData = err?.response?.data;

      if (Array.isArray(errorData?.error)) {
        setMsg(errorData.error.join(" "));
      } else if (errorData?.error) {
        setMsg(errorData.error);
      } else if (errorData?.message) {
        setMsg(errorData.message);
      } else {
        setMsg("Operation failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Soft delete this record?")) return;

    setMsg("");
    setSuccessMsg("");

    try {
      await api.delete(`/api/dynamic/${modelName}/${id}`);
      setSuccessMsg("Record deleted successfully.");
      await loadPageData();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-light">Loading...</div>
      </div>
    );
  }

  if (!modelConfig) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Model not found.</div>
        <Link to="/dynamic" className="btn btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>{modelConfig.label}</h2>

      {msg && (
        <div data-testid="validation-error" className="alert alert-warning">
          {msg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="row g-3">
        {Object.entries(fields).map(([fieldName, config]) => (
          <div className="col-md-6" key={fieldName}>
            <label>{fieldName}</label>
            <input
              data-testid={`field-${fieldName}`}
              type={
                config.format === "email"
                  ? "email"
                  : config.type === "number"
                  ? "number"
                  : config.type === "date"
                  ? "date"
                  : "text"
              }
              className="form-control"
              value={formData[fieldName] ?? ""}
              onChange={(e) =>
                handleInputChange(fieldName, e.target.value, config.type)
              }
              required={config.required}
            />
          </div>
        ))}

        <button
          data-testid="dynamic-submit"
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? "Processing..." : editingId ? "Update" : "Create"}
        </button>
      </form>

      <hr />

      <table className="table">
        <thead>
          <tr>
            {Object.keys(fields).map((f) => (
              <th key={f}>{f}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              {Object.keys(fields).map((f) => (
                <td key={f}>{r.data?.[f]}</td>
              ))}
              <td>
                <button
                  onClick={() => {
                    setEditingId(r._id);
                    setFormData(r.data);
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(r._id)}
                  className="btn btn-sm btn-danger ms-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}