import { useEffect, useState } from "react"
import {
  getAllSports,
  getAllEvents,
  addEvent,
  updateEvent,
  deleteEvent
} from "../../services/api"

const emptyForm = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  imageUrl: "",
  eventUrl: "",
  sportId: ""
}

export default function AdminEvents() {

  const [sports, setSports] = useState([])
  const [events, setEvents] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    try {
      const sportsRes = await getAllSports()
      const eventsRes = await getAllEvents()

      setSports(sportsRes.data)
      setEvents(eventsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {

      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        eventDate: form.eventDate,
        imageUrl: form.imageUrl,
        eventUrl: form.eventUrl
      }

      if (editingId) {
        await updateEvent(editingId, payload)
        alert("Event Updated Successfully")
      } else {
        await addEvent(form.sportId, payload)
        alert("Event Added Successfully")
      }

      setForm(emptyForm)
      setEditingId(null)

      loadData()

    } catch (err) {
      console.error(err)
      alert(editingId ? "Failed to update event" : "Failed to add event")
    }
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate?.slice(0, 16),
      imageUrl: event.imageUrl || "",
      eventUrl: event.eventUrl || "",
      sportId: String(event.sport?.id || "")
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return

    try {
      await deleteEvent(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="admin-section">

      <h2>Manage Events</h2>

      <h3>{editingId ? "Edit Event" : "Add Event"}</h3>

      <form onSubmit={handleSubmit} className="admin-form">

        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <input
          type="datetime-local"
          name="eventDate"
          value={form.eventDate}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
        />

        <input
          type="text"
          name="eventUrl"
          placeholder="Event Link (redirects here when card is clicked)"
          value={form.eventUrl}
          onChange={handleChange}
          required
        />

        <select
          name="sportId"
          value={form.sportId}
          onChange={handleChange}
          disabled={!!editingId}
          required
        >
          <option value="">Select Sport</option>

          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>

        <button type="submit" className="admin-submit-btn">
          {editingId ? "Update Event" : "Add Event"}
        </button>

        {editingId && (
          <button type="button" className="admin-delete-btn" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}

      </form>

      <hr />

      <h3>All Events</h3>

      <div className="admin-table-wrap">

      <table className="admin-table">

        <thead>
          <tr>
            <th>Title</th>
            <th>Sport</th>
            <th>Location</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {events.map(event => (

            <tr key={event.id}>

              <td>{event.title}</td>

              <td>{event.sport?.name}</td>

              <td>{event.location}</td>

              <td>
                {new Date(event.eventDate).toLocaleString()}
              </td>

              <td style={{ display: "flex", gap: "10px" }}>
                <button
                  className="admin-submit-btn"
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </button>
                <button
                  className="admin-delete-btn"
                  onClick={() => handleDelete(event.id)}
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
  )
}