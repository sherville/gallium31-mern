import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function ModelsPage() {
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get("/api/dynamic/models");
        setModels(res.data);
      } catch (err) {
        setMsg(err?.response?.data?.message || "Failed to load models.");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: 1100 }}>
      <div className="mb-3">
        <h2 className="mb-1">Dynamic CRUD Models</h2>
        <p className="text-muted mb-0">
          Select a model to manage its records dynamically.
        </p>
      </div>

      {loading && <div className="alert alert-light">Loading models...</div>}
      {msg && <div className="alert alert-danger">{msg}</div>}

      {!loading && !msg && (
        <div className="row g-3">
          {Object.entries(models).map(([modelName, config]) => (
            <div className="col-md-6 col-lg-4" key={modelName}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{config.label || modelName}</h5>
                  <p className="text-muted small mb-3">
                    Model key: <strong>{modelName}</strong>
                  </p>

                  <div className="mb-3">
                    <strong>Fields:</strong>
                    <ul className="mt-2 mb-0">
                      {Object.entries(config.fields || {}).map(([fieldName, fieldConfig]) => (
                        <li key={fieldName}>
                          {fieldName}{" "}
                          <span className="text-muted">({fieldConfig.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`/dynamic/${modelName}`}
                      className="btn btn-primary w-100"
                    >
                      Open {config.label || modelName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {Object.keys(models).length === 0 && (
            <div className="col-12">
              <div className="alert alert-warning mb-0">No models found.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}