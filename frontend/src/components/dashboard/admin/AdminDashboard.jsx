import { useMemo, useState } from 'react'
import AppFooter from '../../layout/AppFooter'
import AdminHeader from './AdminHeader'
import AdminOverviewPage from './AdminOverviewPage'
import AdminSidebar from './AdminSidebar'
import AnalyticsReportsPage from './AnalyticsReportsPage'
import CentralManagementPage from './CentralManagementPage'
import { createEmptyMenuForm, normalizeSizeOptions } from './utils'

const toFormState = (item) => ({
  name: item.name ?? '',
  category: item.category ?? 'Món chính',
  price: String(item.price ?? ''),
  preparationTime: String(item.preparationTime ?? ''),
  description: item.description ?? '',
  imageUrl: item.imageUrl ?? '',
  station: item.station ?? '',
  isAvailable: Boolean(item.isAvailable),
  sizeOptions: (item.sizeOptions ?? []).join(', '),
})

function AdminDashboard({ session, dashboard, onSignOut }) {
  const [activeSection, setActiveSection] = useState(dashboard.navigation.sideItems[0]?.id ?? 'overview')
  const [menuItems, setMenuItems] = useState(dashboard.centralizedManagement.menuItems ?? [])
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [editingItemId, setEditingItemId] = useState(null)
  const [menuForm, setMenuForm] = useState(() =>
    createEmptyMenuForm(dashboard.centralizedManagement.menuCategories)
  )

  const formMode = editingItemId ? 'edit' : 'create'

  const management = useMemo(
    () => ({
      ...dashboard.centralizedManagement,
      menuItems,
    }),
    [dashboard.centralizedManagement, menuItems]
  )

  const handleFormChange = (field, value) => {
    setMenuForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setEditingItemId(null)
    setMenuForm(createEmptyMenuForm(dashboard.centralizedManagement.menuCategories))
  }

  const handleSubmitMenu = (event) => {
    event.preventDefault()

    const nextItem = {
      id: editingItemId ?? Date.now(),
      sku: editingItemId
        ? menuItems.find((item) => item.id === editingItemId)?.sku ?? `MN-${editingItemId}`
        : `MN-${Date.now().toString().slice(-5)}`,
      name: menuForm.name.trim(),
      category: menuForm.category,
      price: Number(menuForm.price || 0),
      description: menuForm.description.trim(),
      isAvailable: menuForm.isAvailable,
      preparationTime: Number(menuForm.preparationTime || 0),
      imageUrl:
        menuForm.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      sizeOptions: normalizeSizeOptions(menuForm.sizeOptions || 'Mặc định'),
      station: menuForm.station.trim() || 'Chưa gán quầy',
      featured: false,
      lastUpdated: new Date().toISOString(),
    }

    if (!nextItem.name) return

    setMenuItems((current) => {
      if (editingItemId) {
        return current.map((item) => (item.id === editingItemId ? { ...item, ...nextItem } : item))
      }

      return [nextItem, ...current]
    })

    resetForm()
  }

  const handleStartEdit = (item) => {
    setEditingItemId(item.id)
    setMenuForm(toFormState(item))
  }

  const handleDeleteItem = (itemId) => {
    setMenuItems((current) => current.filter((item) => item.id !== itemId))

    if (editingItemId === itemId) {
      resetForm()
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] overflow-hidden border border-[#d8e0e7] bg-white md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="md:col-span-2">
          <AdminHeader session={session} placeholder={dashboard.searchPlaceholder} />
        </div>

        <AdminSidebar
          items={dashboard.navigation.sideItems}
          activeSection={activeSection}
          onChangeSection={setActiveSection}
          onSignOut={onSignOut}
        />

        <section className="min-w-0 space-y-5 bg-[#f8fafc] p-4 md:p-5 lg:p-6">
          {activeSection === 'overview' ? <AdminOverviewPage overview={dashboard.overview} /> : null}
          {activeSection === 'analytics' ? (
            <AnalyticsReportsPage analyticsReports={dashboard.analyticsReports} />
          ) : null}
          {activeSection === 'management' ? (
            <CentralManagementPage
              management={management}
              menuItems={menuItems}
              activeCategory={activeCategory}
              onChangeCategory={setActiveCategory}
              form={menuForm}
              formMode={formMode}
              onFormChange={handleFormChange}
              onSubmitForm={handleSubmitMenu}
              onStartEdit={handleStartEdit}
              onDeleteItem={handleDeleteItem}
              onCancelEdit={resetForm}
            />
          ) : null}

          <AppFooter session={session} dashboard={dashboard} />
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard
