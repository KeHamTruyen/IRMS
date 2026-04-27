import { useCallback, useEffect, useMemo, useState } from 'react'
import { DASHBOARD_CONFIG } from '../constants/dashboard'
import { EMPLOYEE_ROLES, getRoleMeta } from '../constants/roles'
import { authApi } from '../services/authApi'
import { mockApi } from '../services/mockApi'

export function useTerminalAuth() {
  const [authMode, setAuthMode] = useState('employee')
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState('SERVER')
  const [pin, setPin] = useState('')
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
  })
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState(() => authApi.getStoredSession())
  const [dashboardResponse, setDashboardResponse] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(() =>
    Boolean(authApi.getStoredSession())
  )

  const loadDashboard = useCallback(async (role) => {
    if (!role) return null
    return mockApi.getDashboard(role)
  }, [])

  useEffect(() => {
    authApi.persistSession(session)

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

  const handleAuthenticationSuccess = useCallback((nextSession) => {
    setAuthError('')
    setLoadingDashboard(true)
    setPin('')
    setSession(nextSession)
  }, [])

  const submitPinLogin = useCallback(async () => {
    if (pin.length !== 4) {
      setAuthError('Vui lòng nhập đủ 4 chữ số PIN.')
      return
    }

    setIsSubmitting(true)

    try {
      const nextSession = await authApi.loginWithPin({
        role: selectedEmployeeRole,
        pin,
      })
      handleAuthenticationSuccess(nextSession)
    } catch (error) {
      setAuthError(error.message ?? 'Xác thực thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }, [handleAuthenticationSuccess, pin, selectedEmployeeRole])

  const submitAdminLogin = useCallback(
    async (event) => {
      event?.preventDefault?.()

      if (!adminForm.username || !adminForm.password) {
        setAuthError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.')
        return
      }

      setIsSubmitting(true)

      try {
        const nextSession = await authApi.loginAdmin(adminForm)
        handleAuthenticationSuccess(nextSession)
      } catch (error) {
        setAuthError(error.message ?? 'Xác thực thất bại')
      } finally {
        setIsSubmitting(false)
      }
    },
    [adminForm, handleAuthenticationSuccess]
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

  const signOut = useCallback(async () => {
    await authApi.logout()
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
