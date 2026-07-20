import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { registerUser } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBolt, faUser, faEnvelope, faLock, faShieldHalved,
  faTriangleExclamation, faCheck, faCircleCheck
} from "@fortawesome/free-solid-svg-icons"
import "../styles/Register.css"

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    adminCode: "",
  })
  const [registerAsAdmin, setRegisterAsAdmin] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" })
    setError("")
  }

  const handleToggleAdmin = (e) => {
    const checked = e.target.checked
    setRegisterAsAdmin(checked)
    setForm({ ...form, role: checked ? "ADMIN" : "USER", adminCode: checked ? form.adminCode : "" })
    setFieldErrors({ ...fieldErrors, adminCode: "" })
    setError("")
  }

  const validate = () => {
    const errs = {}

    if (!form.name.trim()) {
      errs.name = "Username is required"
    } else if (!USERNAME_REGEX.test(form.name)) {
      errs.name = "3-20 characters, letters, numbers & underscore only"
    }

    if (!form.email.trim()) {
      errs.email = "Email is required"
    } else if (!EMAIL_REGEX.test(form.email)) {
      errs.email = "Enter a valid email address"
    }

    if (!form.password) {
      errs.password = "Password is required"
    } else if (!PASSWORD_REGEX.test(form.password)) {
      errs.password = "Min 8 characters, with at least 1 letter & 1 number"
    }

    if (registerAsAdmin && !form.adminCode.trim()) {
      errs.adminCode = "Admin code is required"
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setLoading(true)
    try {
      const res = await registerUser(form)
      login(res.data, res.data.token)
      navigate(res.data.role === "ADMIN" ? "/admin" : "/")
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === "string" ? msg : (msg?.message || "Registration failed. Email may already exist."))
    } finally {
      setLoading(false)
    }
  }

  // live password rule checks for visual feedback
  const passChecks = {
    length: form.password.length >= 8,
    letter: /[A-Za-z]/.test(form.password),
    number: /\d/.test(form.password),
  }

  return (
    <div className="register-page">
      <div className="register-page__orb register-page__orb--left" />
      <div className="register-page__orb register-page__orb--right" />

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>

        <div className="register-card__topbar" />
        <div className="register-card__body">

          <p className="register-eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="register-title">JOIN SPORTIFY</h1>
          <p className="register-sub">Create your account to get started</p>

          {error && (
            <div className="register-error">
              <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <label className="register-label">
              <FontAwesomeIcon icon={faUser} /> USERNAME
            </label>
            <input
              type="text"
              name="name"
              autoComplete="username"
              placeholder="Choose a username"
              value={form.name}
              onChange={handleChange}
              className={`register-input ${fieldErrors.name ? "register-input--error" : ""}`}
            />
            {fieldErrors.name && (
              <p className="register-field-error">{fieldErrors.name}</p>
            )}

            <label className="register-label">
              <FontAwesomeIcon icon={faEnvelope} /> EMAIL ADDRESS
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className={`register-input ${fieldErrors.email ? "register-input--error" : ""}`}
            />
            {fieldErrors.email && (
              <p className="register-field-error">{fieldErrors.email}</p>
            )}

            <label className="register-label">
              <FontAwesomeIcon icon={faLock} /> PASSWORD
            </label>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              className={`register-input ${fieldErrors.password ? "register-input--error" : ""}`}
            />
            {fieldErrors.password && (
              <p className="register-field-error">{fieldErrors.password}</p>
            )}

            {/* Live password rule checklist */}
            {form.password && (
              <div className="register-pass-rules">
                <span className={passChecks.length ? "rule-ok" : "rule-pending"}>
                  <FontAwesomeIcon icon={passChecks.length ? faCircleCheck : faCheck} /> 8+ characters
                </span>
                <span className={passChecks.letter ? "rule-ok" : "rule-pending"}>
                  <FontAwesomeIcon icon={passChecks.letter ? faCircleCheck : faCheck} /> 1 letter
                </span>
                <span className={passChecks.number ? "rule-ok" : "rule-pending"}>
                  <FontAwesomeIcon icon={passChecks.number ? faCircleCheck : faCheck} /> 1 number
                </span>
              </div>
            )}

            <label className="register-checkbox">
              <input
                type="checkbox"
                checked={registerAsAdmin}
                onChange={handleToggleAdmin}
              />
              <FontAwesomeIcon icon={faShieldHalved} /> Register as Admin
            </label>

            {registerAsAdmin && (
              <>
                <label className="register-label">
                  <FontAwesomeIcon icon={faShieldHalved} /> ADMIN CODE
                </label>
                <input
                  type="password"
                  name="adminCode"
                  autoComplete="off"
                  placeholder="Enter admin signup code"
                  value={form.adminCode}
                  onChange={handleChange}
                  className={`register-input ${fieldErrors.adminCode ? "register-input--error" : ""}`}
                />
                {fieldErrors.adminCode && (
                  <p className="register-field-error">{fieldErrors.adminCode}</p>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="register-btn">
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="register-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>

        </div>
      </motion.div>
    </div>
  )
}