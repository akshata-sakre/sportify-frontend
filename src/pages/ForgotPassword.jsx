import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { forgotPassword, verifyOtp, resetPassword } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt, faEnvelope, faKey, faLock,
  faCheckCircle, faTriangleExclamation, faArrowLeft
} from '@fortawesome/free-solid-svg-icons'
import '../styles/ForgotPassword.css'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password, 4: success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setStep(2)
  } catch (err) {
  const msg = err.response?.data
  setError(typeof msg === 'string' ? msg : (msg?.message || msg?.error || 'No account found with this email'))
} finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      setStep(3)
  } catch (err) {
  const msg = err.response?.data
  setError(typeof msg === 'string' ? msg : (msg?.message || msg?.error || 'Invalid or expired OTP'))
} finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ email, otp, newPassword })
      setStep(4)
  } catch (err) {
  const msg = err.response?.data
  setError(typeof msg === 'string' ? msg : (msg?.message || msg?.error || 'Invalid or expired OTP'))
} finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-page">
      <div className="fp-page__orb fp-page__orb--left" />
      <div className="fp-page__orb fp-page__orb--right" />

      <motion.div
        className="fp-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>

        <div className="fp-card__topbar" />
        <div className="fp-card__body">

          <Link to="/login" className="fp-back-link">
            <FontAwesomeIcon icon={faArrowLeft} /> BACK TO LOGIN
          </Link>

          <p className="fp-eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>

          <AnimatePresence mode="wait">

            {/* STEP 1 — EMAIL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}>
                <h1 className="fp-title">FORGOT PASSWORD</h1>
                <p className="fp-sub">Enter your email and we'll send you an OTP to reset your password</p>

                {error && (
                  <div className="fp-error">
                    <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                  </div>
                )}

                <form onSubmit={handleSendOtp}>
                  <label className="fp-label">
                    <FontAwesomeIcon icon={faEnvelope} /> EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="fp-input"
                  />
                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? 'SENDING OTP...' : 'SEND OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}>
                <h1 className="fp-title">VERIFY OTP</h1>
                <p className="fp-sub">Enter the OTP sent to <span className="fp-email-highlight">{email}</span></p>

                {error && (
                  <div className="fp-error">
                    <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <label className="fp-label">
                    <FontAwesomeIcon icon={faKey} /> OTP CODE
                  </label>
                 <input
  type="text"
  name="otp-code"
  autoComplete="off"
  value={otp}
  onChange={e => setOtp(e.target.value)}
  placeholder="Enter 6-digit OTP"
  maxLength={6}
  required
  className="fp-input fp-input--otp"
/>
                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                  </button>
                </form>

                <p className="fp-resend">
                  Didn't get the code?{' '}
                  <span onClick={() => setStep(1)}>Resend OTP</span>
                </p>
              </motion.div>
            )}

            {/* STEP 3 — NEW PASSWORD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}>
                <h1 className="fp-title">RESET PASSWORD</h1>
                <p className="fp-sub">OTP verified. Enter your new password</p>

                {error && (
                  <div className="fp-error">
                    <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <label className="fp-label">
                    <FontAwesomeIcon icon={faLock} /> NEW PASSWORD
                  </label>
                 <input
  type="password"
  name="new-password-field"
  autoComplete="new-password"
  value={newPassword}
  onChange={e => setNewPassword(e.target.value)}
  placeholder="Enter new password"
  required
  className="fp-input"
/>

                  <label className="fp-label">
                    <FontAwesomeIcon icon={faLock} /> CONFIRM PASSWORD
                  </label>
 <input
  type="password"
  name="confirm-password-field"
  autoComplete="new-password"
  value={confirmPassword}
  onChange={e => setConfirmPassword(e.target.value)}
  placeholder="Confirm new password"
  required
  className="fp-input"
/>
                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4 — SUCCESS */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fp-success">
                <div className="fp-success__icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h1 className="fp-success__title">PASSWORD RESET!</h1>
                <p className="fp-success__sub">Your password has been changed successfully</p>
                <button onClick={() => navigate('/login')} className="fp-btn">
                  GO TO LOGIN
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}