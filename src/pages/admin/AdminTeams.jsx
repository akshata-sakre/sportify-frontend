import { useEffect, useState } from "react";
import {
  getAllTeams,
  getAllSports,
  addTeam,
  updateTeam,
  deleteTeam,
} from "../../services/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPlus,
  faTrash,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    teamName: "",
    city: "",
    logoUrl: "",
  });

  const [sportId, setSportId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const teamRes = await getAllTeams();
    const sportRes = await getAllSports();

    setTeams(teamRes.data);
    setSports(sportRes.data);
  };

  const resetForm = () => {
    setForm({ teamName: "", city: "", logoUrl: "" });
    setSportId("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await updateTeam(editingId, form);
    } else {
      await addTeam(sportId, form);
    }

    resetForm();
    loadData();
    setShowForm(false);
  };

  const handleEdit = (team) => {
    setShowForm(true);
    setEditingId(team.id);
    setSportId(String(team.sport.id));
    setForm({
      teamName: team.teamName,
      city: team.city,
      logoUrl: team.logoUrl,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team?")) return;

    await deleteTeam(id);

    loadData();
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
            TEAMS
          </h1>
        </div>

        <button
          className="admin-add-btn"
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          ADD TEAM
        </button>
      </div>

      {showForm && (

        <form
          className="admin-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form__grid">

            <div className="admin-form__group">
              <label>Sport</label>

              <select
                value={sportId}
                onChange={(e) =>
                  setSportId(e.target.value)
                }
                disabled={!!editingId}
                required
              >
                <option value="">
                  Select Sport
                </option>

                {sports.map((sport) => (
                  <option
                    key={sport.id}
                    value={sport.id}
                  >
                    {sport.name}
                  </option>
                ))}

              </select>
            </div>

            <div className="admin-form__group">
              <label>Team Name</label>

              <input
                type="text"
                value={form.teamName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teamName: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="admin-form__group">
              <label>City</label>

              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="admin-form__group admin-form__group--full">
              <label>Logo URL</label>

              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    logoUrl: e.target.value,
                  })
                }
                required
              />
            </div>

          </div>

          <button
            type="submit"
            className="admin-submit-btn"
          >
            {editingId ? "UPDATE TEAM" : "ADD TEAM"}
          </button>

        </form>

      )}

      <div className="admin-table-wrap">

        <table className="admin-table">

          <thead>

            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Team</th>
              <th>Sport</th>
              <th>City</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {teams.map((team) => (

              <tr key={team.id}>

                <td>#{team.id}</td>

                <td>

                  <img
                    src={team.logoUrl}
                    alt={team.teamName}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

                </td>

                <td>{team.teamName}</td>

                <td>{team.sport.name}</td>

                <td>{team.city}</td>

                <td style={{ display: "flex", gap: "10px" }}>

                  <button
                    className="admin-submit-btn"
                    type="button"
                    onClick={() => handleEdit(team)}
                  >
                    EDIT
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() =>
                      handleDelete(team.id)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                    />
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