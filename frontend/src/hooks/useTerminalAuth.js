import { useCallback, useEffect, useMemo, useState } from 'react'
import { DASHBOARD_CONFIG } from '../constants/dashboard'
import { EMPLOYEE_ROLES, getRoleMeta } from '../constants/roles'
import { mockApi } from '../services/mockApi'

const SESSION_STORAGE_KEY = 'irms-session'

const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeStoredSession = (session) => {
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function useTerminalAuth() {
  const [authMode, setAuthMode] = useState('employee')
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState('SERVER')
  const [pin, setPin] = useState('')
  const [adminForm, setAdminForm] = useState({
    username: 'admin',
    password: 'password123',
  })
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState(() => readStoredSession())
  const [dashboardResponse, setDashboardResponse] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(() => Boolean(readStoredSession()))
  const [demoAccess, setDemoAccess] = useState([])

  const loadDashboard = useCallback(async (role) => {
    if (!role) return null
    return mockApi.getDashboard(role)
  }, [])

  useEffect(() => {
    writeStoredSession(session)

    if (session?.role) {
      let cancelled = false
      window.location.hash = `/dashboard/${session.role.toLowerCase()}`

      ;(async () => {
        const response = await loadDashboard(session.role)
        if (cancelled) return

        setDashboardResponse(response?.success ? response.data : null)
        setLoadingDashboard(false)
      })()

      return () => {
        cancelled = true
      }
    }

    window.location.hash = '/login'
  }, [loadDashboard, session])

  useEffect(() => {
    mockApi.getDemoAccess().then((response) => {
      if (response.success) {
        setDemoAccess(response.data ?? [])
      }
    })
  }, [])

  const handleAuthenticationResult = useCallback((response) => {
    if (!response.success) {
      setAuthError(response.error ?? 'Xác thực thất bại')
      return
    }

    setAuthError('')
    setLoadingDashboard(true)
    setPin('')
    setSession(response.data)
  }, [])

  const submitPinLogin = useCallback(async () => {
    if (pin.length !== 4) {
      setAuthError('Vui lòng nhập đủ 4 chữ số PIN.')
      return
    }

    setIsSubmitting(true)
    const response = await mockApi.loginWithPin({
      role: selectedEmployeeRole,
      pin,
    })
    setIsSubmitting(false)
    handleAuthenticationResult(response)
  }, [handleAuthenticationResult, pin, selectedEmployeeRole])

  const submitAdminLogin = useCallback(
    async (event) => {
      event?.preventDefault?.()

      if (!adminForm.username || !adminForm.password) {
        setAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
        return
      }

      setIsSubmitting(true)
      const response = await mockApi.loginAdmin(adminForm)
      setIsSubmitting(false)
      handleAuthenticationResult(response)
    },
    [adminForm, handleAuthenticationResult]
  )

  const appendPinDigit = useCallback((digit) => {
    setAuthError('')
    setPin((current) => (current.length >= 4 ? current : `${current}${digit}`))
  }, [])

  const removeLastPinDigit = useCallback(() => {
    setAuthError('')
    setPin((current) => current.slice(0, -1))
  }, [])

  const resetPin = useCallback(() => {
    setAuthError('')
    setPin('')
  }, [])

  const updateAdminField = useCallback((field, value) => {
    setAuthError('')
    setAdminForm((current) => ({
      ...current,
      [field]: value,
    }))
  }, [])

  const handleSelectAuthMode = useCallback((mode) => {
    setAuthMode(mode)
    setAuthError('')
  }, [])

  const handleSelectEmployeeRole = useCallback((role) => {
    setSelectedEmployeeRole(role)
    setAuthError('')
    setPin('')
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    setAuthError('')
    setPin('')
    setDashboardResponse(null)
    setLoadingDashboard(false)
  }, [])

  const dashboardConfig = useMemo(
    () => DASHBOARD_CONFIG[session?.role] ?? DASHBOARD_CONFIG.SERVER,
    [session?.role]
  )

  const roleMeta = useMemo(
    () => getRoleMeta(session?.role ?? selectedEmployeeRole),
    [selectedEmployeeRole, session?.role]
  )

  return {
    authMode,
    selectedEmployeeRole,
    employeeRoles: EMPLOYEE_ROLES,
    pin,
    adminForm,
    authError,
    isSubmitting,
    session,
    dashboard: dashboardResponse,
    dashboardConfig,
    roleMeta,
    loadingDashboard,
    demoAccess,
    onSelectAuthMode: handleSelectAuthMode,
    onSelectEmployeeRole: handleSelectEmployeeRole,
    onAppendPin: appendPinDigit,
    onRemoveLastPinDigit: removeLastPinDigit,
    onResetPin: resetPin,
    onSubmitPinLogin: submitPinLogin,
    onSubmitAdminLogin: submitAdminLogin,
    onUpdateAdminField: updateAdminField,
    onSignOut: signOut,
  }
}
