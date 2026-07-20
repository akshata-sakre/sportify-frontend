import { useEffect, useState } from "react"
import {
  getAllVideos,
  getAllSports,
  addVideo,
  updateVideo,
  deleteVideo
} from "../../services/api"

const emptyForm = {
  title: "",
  url: "",
  thumbnailUrl: "",
  type: ""
}

export default function AdminVideos() {

  const [videos, setVideos] = useState([])
  const [sports, setSports] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState(emptyForm)

  const [sportId, setSportId] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const videoRes = await getAllVideos()
    const sportRes = await getAllSports()

    setVideos(videoRes.data)
    setSports(sportRes.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingId) {
      await updateVideo(editingId, form)
    } else {
      await addVideo(sportId, form)
    }

    setForm(emptyForm)
    setSportId("")
    setEditingId(null)

    loadData()
  }

  const handleEdit = (video) => {
    setEditingId(video.id)
    setSportId(String(video.sport?.id || ""))
    setForm({
      title: video.title,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      type: video.type
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSportId("")
  }

  const handleDelete = async (id) => {
    await deleteVideo(id)
    loadData()
  }

return (
  <div className="admin-videos">

    <h1>MANAGE VIDEOS</h1>

    <form className="admin-video-form" onSubmit={handleSubmit}>

      <h2>{editingId ? "Edit Video" : "Add New Video"}</h2>

      <input
        placeholder="Video Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
      />

      <input
        placeholder="YouTube URL"
        value={form.url}
        onChange={(e) =>
          setForm({ ...form, url: e.target.value })
        }
      />

      <input
        placeholder="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={(e) =>
          setForm({ ...form, thumbnailUrl: e.target.value })
        }
      />

      <input
        placeholder="Video Type (Highlights, Interview, Live)"
        value={form.type}
        onChange={(e) =>
          setForm({ ...form, type: e.target.value })
        }
      />

      <select
        value={sportId}
        onChange={(e) => setSportId(e.target.value)}
        disabled={!!editingId}
      >
        <option value="">Select Sport</option>

        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="admin-video-btn"
      >
        {editingId ? "UPDATE VIDEO" : "ADD VIDEO"}
      </button>

      {editingId && (
        <button
          type="button"
          className="admin-delete-btn"
          onClick={handleCancelEdit}
        >
          CANCEL
        </button>
      )}

    </form>

    {videos.length === 0 ? (

      <div className="admin-video-empty">
        No videos added yet
      </div>

    ) : (

      <div className="admin-video-grid">

       {videos.map(video => (
  <div className="admin-video-card" key={video.id}>

            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="admin-video-thumb"
            />

            <div className="admin-video-content">

              <h3 className="admin-video-title">
                {video.title}
              </h3>

              <p className="admin-video-meta">
                {video.sport?.name} • {video.type}
              </p>

              <div className="admin-video-actions">

                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-watch-btn"
                >
                  WATCH
                </a>

                <button
                  className="admin-submit-btn"
                  onClick={() => handleEdit(video)}
                >
                  EDIT
                </button>

                <button
                  className="admin-delete-btn"
                  onClick={() => handleDelete(video.id)}
                >
                  DELETE
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>
)
}