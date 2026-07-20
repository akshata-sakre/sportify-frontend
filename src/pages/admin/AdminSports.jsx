import { useEffect, useState } from "react";
import {
  getAllSports,
  getSportById,
  addSport,
  updateSport,
  deleteSport,
} from "../../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faFutbol,
  faPlus,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSports() {

  const [sports, setSports] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [searchId, setSearchId] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
  });

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    const res = await getAllSports();
    setSports(res.data);
  };

  const handleSearch = async () => {

    if (!searchId) {
      loadSports();
      return;
    }

    try {
      const res = await getSportById(searchId);
      setSports([res.data]);
    } catch {
      alert("Sport not found");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (editingId) {

        await updateSport(editingId, form);

      } else {

        await addSport(form);

      }

      setForm({
        name: "",
        description: "",
        iconUrl: "",
      });

      setEditingId(null);

      setShowForm(false);

      loadSports();

    } catch {

      alert("Operation failed");

    }
    };
    
   return (
    <div className="admin-page">

      <div className="admin-page__header">

        <div>

          <p className="admin-page__eyebrow">
            <FontAwesomeIcon icon={faBolt} />
            MANAGE
          </p>

          <h1 className="admin-page__title">
            SPORTS
          </h1>

        </div>

        <button
          className="admin-add-btn"
          onClick={() => {

            setShowForm(!showForm);

            setEditingId(null);

            setForm({
              name: "",
              description: "",
              iconUrl: "",
            });

          }}
        >

          <FontAwesomeIcon icon={faPlus} />

          ADD SPORT

        </button>

      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "25px",
        }}
      >

        <input
          className="admin-status-select"
          style={{ width: "160px" }}
          placeholder="Search ID"
          value={searchId}
          onChange={(e) =>
            setSearchId(e.target.value)
          }
        />

        <button
          className="admin-submit-btn"
          onClick={handleSearch}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
          />

          SEARCH

        </button>

      </div>

      {showForm && (

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form__grid">

            <div className="admin-form__group">

              <label>Sport Name</label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />

            </div>

            <div className="admin-form__group admin-form__group--full">

              <label>Description</label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
              />

            </div>

            <div className="admin-form__group admin-form__group--full">

              <label>Icon URL</label>

              <input
                value={form.iconUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    iconUrl: e.target.value,
                  })
                }
                required
              />

            </div>

          </div>

          <button
            className="admin-submit-btn"
            type="submit"
          >

            {editingId
              ? "UPDATE SPORT"
              : "ADD SPORT"}

          </button>

        </form>

      )}
         <div className="admin-table-wrap">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {sports.map((sport) => (

              <tr key={sport.id}>

                <td>#{sport.id}</td>

                <td>
                  <img
                    src={sport.iconUrl}
                    alt={sport.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,0,51,.3)"
                    }}
                  />
                </td>

                <td>
                  <strong>{sport.name}</strong>
                </td>

                <td>
                  {sport.description}
                </td>

                <td
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >

                  <button
                    className="admin-submit-btn"
                    type="button"
                    onClick={() => {

                      setShowForm(true);

                      setEditingId(sport.id);

                      setForm({

                        name: sport.name,

                        description: sport.description,

                        iconUrl: sport.iconUrl,

                      });

                    }}
                  >
                    EDIT
                  </button>

                  <button
                    className="admin-delete-btn"
                    type="button"
                    onClick={async () => {

                      if (
                        !window.confirm(
                          "Delete this sport?"
                        )
                      )
                        return;

                      await deleteSport(sport.id);

                      loadSports();

                    }}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}