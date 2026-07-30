'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bell, User, Info, Moon, Settings, Users, Calendar,
  ShoppingCart, Zap, BarChart3, Folder, Phone, HelpCircle,
  Mail, Menu, MoreVertical, Check, CircleHelp, X, Pencil,
  Plus, CheckCircle2, Search, ChevronDown, Filter, Download,
  Smartphone, CirclePlus, Mic, Headphones, Voicemail,
  ChevronRight, Trash2, ArrowLeft, Shield, PhoneForwarded,
  PhoneOff, ListChecks, VoicemailSquare, Hash
} from 'lucide-react'

// ─── Phone Mask Helper ─────────────────────────────
function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+7 ${digits}`
  if (digits.length <= 6) return `+7 ${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8) return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`
  return `+7 ${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
}

// ─── Floating Label Input ─────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
  rightIcon = false,
  mask,
}: {
  label: string
  value?: string
  onChange?: (val: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  rightIcon?: boolean
  mask?: 'phone'
}) {
  const hasValue = !!value
  const pr = rightIcon ? 'pr-10' : 'pr-4'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange || readOnly) return
    let raw = e.target.value
    if (mask === 'phone') {
      // Store only digits (strip +7 prefix if present)
      const digits = raw.replace(/\D/g, '')
      // If starts with 7 or 8, skip country code digit
      if (digits.length > 0 && (digits[0] === '7' || digits[0] === '8')) {
        raw = digits.slice(1)
      } else {
        raw = digits
      }
    }
    onChange(raw)
  }

  const displayValue = mask === 'phone' && value ? formatPhoneMask(value) : (value || '')

  return (
    <div className="relative">
      <input
        type={type}
        value={displayValue}
        onChange={handleChange}
        placeholder={hasValue ? ' ' : (placeholder || label)}
        className={`w-full h-[48px] px-4 ${pr} ${hasValue ? 'pt-[12px]' : ''} bg-gray-100 rounded-lg text-sm text-gray-900 border-[1.5px] border-transparent focus:border-gray-900 focus:bg-white focus:outline-none transition-colors placeholder:text-gray-400 ${readOnly ? 'cursor-default' : ''}`}
        readOnly={readOnly}
      />
      {hasValue && (
        <span className="absolute left-4 top-[8px] text-[10px] text-gray-500 font-medium pointer-events-none leading-none">
          {label}
        </span>
      )}
    </div>
  )
}

// ─── Sidebar Icons Config ─────────────────────────────
const sidebarIcons = [
  { icon: Menu, label: 'Меню', isBurger: true },
  { icon: Users, label: 'Пользователи' },
  { icon: Calendar, label: 'Календарь' },
  { icon: ShoppingCart, label: 'Магазин' },
  { icon: Zap, label: 'Быстрые действия' },
  { icon: BarChart3, label: 'Аналитика' },
  { icon: Folder, label: 'Файлы' },
  { icon: Phone, label: 'Звонки' },
  { icon: Settings, label: 'Настройки', isSettings: true },
  { icon: HelpCircle, label: 'Справка' },
  { icon: Mail, label: 'Почта' },
]

// ─── Tab Config ────────────────────────────────────────
const tabs = [
  'Профиль компании',
  'Расписание',
  'Роли доступа',
  'Подразделения',
  'Файлы',
  'Голосовая почта',
]

// ─── Main Component ────────────────────────────────────
export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'employee-profile' | 'employee-edit-rights'>('home')
  const [activeTab, setActiveTab] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toggle2FA, setToggle2FA] = useState(false)
  const [checkboxConsent, setCheckboxConsent] = useState(true)
  const [showNotificationBadge, setShowNotificationBadge] = useState(true)
  const [scenarioStep, setScenarioStep] = useState<'idle' | 'notification-open' | 'settings-page'>('idle')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [phonePopoverOpen, setPhonePopoverOpen] = useState(false)
  const [consentPopoverOpen, setConsentPopoverOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [howItWorksStep, setHowItWorksStep] = useState(0)

  // New feature dialog
  const [showNewFeatureDialog, setShowNewFeatureDialog] = useState(false)

  // Push confirmation dialog
  const [showPushDialog, setShowPushDialog] = useState(false)
  const [pushTimer, setPushTimer] = useState(30)

  // Employee profile
  const [selectedEmployeeIdx, setSelectedEmployeeIdx] = useState(0)
  const [empMobileId, setEmpMobileId] = useState('')
  const [empMobileIdDisplay, setEmpMobileIdDisplay] = useState('')
  const [showEmpPushDialog, setShowEmpPushDialog] = useState(false)
  const [empPushTimer, setEmpPushTimer] = useState(30)
  const [empToggleAccess, setEmpToggleAccess] = useState(true)
  const [empToggle2FA, setEmpToggle2FA] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const phonePopoverRef = useRef<HTMLDivElement>(null)
  const consentPopoverRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)

  // ─── Card field states ────────────────────────────
  // Card 1
  const [card1CompanyName, setCard1CompanyName] = useState('ООО «Феникс-Инвестстрой»')
  const [card1Dirty, setCard1Dirty] = useState(false)

  // Card 2
  const [card2Fio, setCard2Fio] = useState('')
  const [card2Phone, setCard2Phone] = useState('')
  const [card2Email, setCard2Email] = useState('pasterpanenko@mail.ru')
  const [card2Dirty, setCard2Dirty] = useState(false)

  // Card 3
  const [card3PasswordEmail, setCard3PasswordEmail] = useState('pasterpanenko@mail.ru')
  const [card3MobileId, setCard3MobileId] = useState('')
  const [card3Dirty, setCard3Dirty] = useState(false)
  const [toggle2FADirty, setToggle2FADirty] = useState(false)

  // ─── Snackbar (multi-message) ────────────────────
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg)
    setSnackbarOpen(true)
    setTimeout(() => setSnackbarOpen(false), 3000)
  }

  // ─── Home page state ────────────────────────────
  const [homeNumberTab, setHomeNumberTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSave1 = () => { setCard1Dirty(false); showSnackbar('Изменения сохранены') }
  const handleSave2 = () => { setCard2Dirty(false); showSnackbar('Изменения сохранены') }

  const handleSave3 = () => {
    if (card3MobileId) {
      // Show push dialog if Mobile ID has a value
      setPushTimer(30)
      setShowPushDialog(true)
    } else {
      setCard3Dirty(false)
      setToggle2FADirty(false)
      showSnackbar('Изменения сохранены')
    }
  }

  const howItWorksSteps = [
    {
      title: 'Настройте профиль компании',
      text: 'Укажите контактные данные на которые вы хотите получать важные уведомления. В случае возникновения проблем, клиентская поддержка свяжется по указанным контактам',
    },
    {
      title: 'Настройте двухфакторную аутентификацию',
      paragraphs: [
        'Указывайте только рабочую почту для сброса пароля.',
        'Если пароль администратора будет украден, наличие второго фактора затруднит доступ злоумышленникам',
      ],
    },
  ]

  // ─── Push timer effect ────────────────────────
  useEffect(() => {
    if (showPushDialog && pushTimer > 0) {
      const id = setInterval(() => setPushTimer(t => {
        if (t <= 1) {
          clearInterval(id)
          return 0
        }
        return t - 1
      }), 1000)
      return () => clearInterval(id)
    }
  }, [showPushDialog, pushTimer])

  // ─── Employee Push timer effect ────────────────────────
  useEffect(() => {
    if (showEmpPushDialog && empPushTimer > 0) {
      const id = setInterval(() => setEmpPushTimer(t => {
        if (t <= 1) {
          clearInterval(id)
          return 0
        }
        return t - 1
      }), 1000)
      return () => clearInterval(id)
    }
  }, [showEmpPushDialog, empPushTimer])

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBellClick = () => {
    setNotificationsOpen(!notificationsOpen)
    if (!notificationsOpen) {
      setScenarioStep('notification-open')
    }
  }

  const handleGoToProfile = () => {
    setNotificationsOpen(false)
    setScenarioStep('settings-page')
    setShowNotificationBadge(false)
    setCurrentPage('settings')
    setShowNewFeatureDialog(true)
  }

  const togglePopover = () => {
    setPopoverOpen(!popoverOpen)
  }

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
      if (phonePopoverRef.current && !phonePopoverRef.current.contains(e.target as Node)) {
        setPhonePopoverOpen(false)
      }
      if (consentPopoverRef.current && !consentPopoverRef.current.contains(e.target as Node)) {
        setConsentPopoverOpen(false)
      }
      if (howItWorksRef.current && !howItWorksRef.current.contains(e.target as Node)) {
        setHowItWorksOpen(false)
      }
    }
    if (popoverOpen || phonePopoverOpen || consentPopoverOpen || howItWorksOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [popoverOpen, phonePopoverOpen, consentPopoverOpen, howItWorksOpen])

  // ─── Dirty trackers per card ─────────────────────
  const markCard1Dirty = useCallback((val: string) => { setCard1CompanyName(val); setCard1Dirty(true) }, [])
  const markCard2Dirty = useCallback((val: string) => { setCard2Fio(val); setCard2Dirty(true) }, [])
  const markCard2PhoneDirty = useCallback((val: string) => { setCard2Phone(val); setCard2Dirty(true) }, [])
  const markCard2EmailDirty = useCallback((val: string) => { setCard2Email(val); setCard2Dirty(true) }, [])
  const markCard3EmailDirty = useCallback((val: string) => { setCard3PasswordEmail(val); setCard3Dirty(true) }, [])
  const markCard3MobileIdDirty = useCallback((val: string) => { setCard3MobileId(val); setCard3Dirty(true) }, [])
  const handleToggle2FA = () => { setToggle2FA(!toggle2FA); setToggle2FADirty(true) }

  const card1CanSave = card1Dirty
  const card2CanSave = card2Dirty
  const card3CanSave = card3Dirty || toggle2FADirty

  // ─── Push dialog handlers ──────────────────────
  const handlePushCancel = () => {
    setShowPushDialog(false)
    showSnackbar('Новый номер не сохранен. Не удалось получить подтверждение пуша')
    setCard3MobileId('')
    setCard3Dirty(false)
  }

  const handlePushResend = () => {
    setPushTimer(30)
  }

  const handlePushSimulate = () => {
    setShowPushDialog(false)
    setCard3Dirty(false)
    setToggle2FADirty(false)
    showSnackbar('Изменения сохранены')
  }

  // ─── Sample table data ──────────────────────────
  const sampleNumbers = [
    { number: '+7 (999) 123-45-67', name: 'Иванов Иван', short: '101', sip: 'Online', minutes: '542', dept: 'Отдел продаж', role: 'Администратор', contract: '№1234', services: ['recording'], email: 'ivanov@company.ru', position: 'Менеджер', mobileId: '' },
    { number: '+7 (999) 234-56-78', name: 'Петрова Мария', short: '102', sip: 'Offline', minutes: '—', dept: 'Поддержка', role: 'Оператор', contract: '№1234', services: [], email: 'petrova@company.ru', position: 'Старший оператор', mobileId: '' },
    { number: '+7 (999) 345-67-89', name: 'Сидоров Алексей', short: '103', sip: 'Online', minutes: '1 230', dept: 'Отдел продаж', role: 'Менеджер', contract: '№1234', services: ['recording', 'voicemail'], email: 'sidorov@company.ru', position: 'Руководитель отдела', mobileId: '' },
  ]

  // ─── Employee helpers ──────────────────────────
  const emp = sampleNumbers[selectedEmployeeIdx]
  const empShortNumber = emp.number.replace(/[^\d]/g, '').slice(1)

  const handleGoToEmployeeProfile = (idx: number) => {
    setSelectedEmployeeIdx(idx)
    setEmpMobileId(emp.mobileId)
    setEmpMobileIdDisplay('')
    setCurrentPage('employee-profile')
  }

  const handleGoToEmployeeEditRights = () => {
    setEmpMobileIdDisplay('')
    setCurrentPage('employee-edit-rights')
  }

  const handleEmpMobileIdCheck = () => {
    if (empMobileIdDisplay) {
      setEmpPushTimer(30)
      setShowEmpPushDialog(true)
    }
  }

  const handleEmpPushCancel = () => {
    setShowEmpPushDialog(false)
    showSnackbar('Новый номер не сохранен. Не удалось получить подтверждение пуша')
    setEmpMobileId('')
    setEmpMobileIdDisplay('')
  }

  const handleEmpPushResend = () => {
    setEmpPushTimer(30)
  }

  const handleEmpPushSimulate = () => {
    setShowEmpPushDialog(false)
    setEmpMobileId(empMobileIdDisplay)
    sampleNumbers[selectedEmployeeIdx].mobileId = empMobileIdDisplay
    showSnackbar('Изменения сохранены')
    setCurrentPage('employee-profile')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="w-[72px] min-h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        {sidebarIcons.map((item, idx) => {
          const Icon = item.icon
          const isBurger = item.isBurger
          const isSettings = item.isSettings
          let buttonClass = ''
          if (isBurger) {
            buttonClass = currentPage === 'home'
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          } else if (isSettings) {
            buttonClass = currentPage === 'settings'
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          } else {
            buttonClass = 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }
          return (
            <button
              key={idx}
              onClick={() => {
                if (isBurger) setCurrentPage('home')
                if (isSettings) setCurrentPage('settings')
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${buttonClass}`}
              title={item.label}
            >
              <Icon size={20} strokeWidth={1.8} />
            </button>
          )
        })}
      </aside>

      {/* ─── Main Area ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ─── Header ──────────────────────────── */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Л</span>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">логотип</span>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Moon size={20} strokeWidth={1.8} />
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={handleBellClick}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  notificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} strokeWidth={1.8} />
                {showNotificationBadge && (
                  <span className="notification-badge absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </button>

              {/* ─── Notifications Dropdown ───────────────── */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-[420px] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Уведомления</h3>
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">Прочитать все</button>
                  </div>

                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Users size={20} className="text-green-600" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">Новый функционал</h4>
                          <button className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5 rounded">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          Доступен новый способ входа по Mobile ID. Теперь вы можете заходить в личный кабинет без пароля, подтверждая вход Push-уведомлением на своем телефоне.
                        </p>
                        <button
                          onClick={handleGoToProfile}
                          className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,102,204,0.12)] transition-all duration-200"
                        >
                          Перейти в профиль
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium w-full text-center">
                      Все уведомления
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Settings size={20} strokeWidth={1.8} />
            </button>

            <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <User size={20} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* ─── Content ──────────────────────────── */}
        {currentPage === 'home' ? (
          /* ═══════════════════════════════════════════════════════
             HOME PAGE
             ═══════════════════════════════════════════════════════ */
          <main className="flex-1 p-8 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-8">Ваша АТС</h1>

              {/* ─── Progress Card ──────────────────── */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <div className="flex items-start gap-6">
                  {/* Circular progress */}
                  <div className="shrink-0">
                    <div
                      className="w-[88px] h-[88px] rounded-full flex items-center justify-center relative"
                      style={{
                        background: `conic-gradient(#7C3AED 0% 25%, #E5E7EB 25% 100%)`,
                      }}
                    >
                      <div className="w-[72px] h-[72px] rounded-full bg-white flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">25%</span>
                        <span className="text-[10px] text-gray-500 leading-tight">настроено</span>
                      </div>
                    </div>
                  </div>

                  {/* Center text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">Основные настройки АТС</h2>
                    <p className="text-sm text-gray-500 mt-1">Осталось 3 шага</p>
                  </div>
                </div>

                {/* Action items */}
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">Подключить номера сотрудников</span>
                  </div>
                  {[
                    'Подключить многоканальные номера',
                    'Создать маршрут',
                    'Подключить запись звонков',
                  ].map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <CirclePlus size={14} className="text-gray-400" strokeWidth={2} />
                      </div>
                      <span className="text-sm text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Three Stats Cards ──────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Tariff Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Стандартный</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Пакет</p>
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 border border-gray-200 hover:bg-gray-100 transition-colors">
                      <Pencil size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-base font-semibold text-gray-900">3 490 ₽</span>
                      <p className="text-xs text-gray-500 mt-0.5">Пакет</p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900">0 ₽</span>
                      <p className="text-xs text-gray-500 mt-0.5">Сверх пакета</p>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900">3 490 ₽</span>
                      <p className="text-xs text-gray-500 mt-0.5">Итого</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Открыть счета
                  </button>
                </div>

                {/* Numbers Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">20 номеров из 20</h3>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-3 mb-3 overflow-hidden">
                    <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '5%' }} />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shrink-0" />
                      <span className="text-xs text-gray-600">Подключено — 1 номер сотрудников</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
                      <span className="text-xs text-gray-600">Осталось — 2 многоканальных</span>
                    </div>
                  </div>
                </div>

                {/* Promo Card */}
                <div className="bg-[#1F1F1F] rounded-xl p-6 text-white">
                  <h3 className="text-sm font-semibold mb-2">Внешние SIP-номера</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Подключайте внешние SIP-номера для приёма и совершения звонков через вашу АТС из любой точки мира с высокими качеством связи.
                  </p>
                  <button className="mt-4 text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                    Смотрите, как это работает &gt;&gt;
                  </button>
                </div>
              </div>

              {/* ─── Number Management Section ──────────── */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Управление номерами</h2>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-200 mb-6">
                  {['Номера сотрудников', 'Многоканальные номера'].map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHomeNumberTab(idx)}
                      className={`pb-3 text-sm font-medium transition-colors relative ${
                        homeNumberTab === idx
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                      {homeNumberTab === idx && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-[240px]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск"
                        className="w-full h-9 pl-9 pr-4 bg-gray-100 rounded-lg text-sm text-gray-900 border-[1.5px] border-transparent focus:border-gray-900 focus:bg-white focus:outline-none transition-colors placeholder:text-gray-400"
                      />
                    </div>
                    <div className="relative">
                      <select className="h-9 px-3 pr-8 bg-gray-100 rounded-lg text-sm text-gray-700 border-[1.5px] border-transparent focus:border-gray-900 focus:bg-white focus:outline-none appearance-none cursor-pointer">
                        <option>Везде</option>
                        <option>Номер</option>
                        <option>Имя</option>
                        <option>Подразделение</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200">
                      <Filter size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="h-9 px-3 flex items-center gap-1.5 rounded-lg text-sm text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                      <Download size={14} strokeWidth={1.8} />
                      Импорт
                    </button>
                    <button className="h-9 px-4 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                      + Добавить номера
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-10" />
                      <col style={{ width: 174 }} />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col className="w-10" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Номер</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Имя</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Короткий</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Статус SIP</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Доступно, мин</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Подразделение</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Роль</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Договор</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Услуги</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleNumbers.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                            <button
                              onClick={() => handleGoToEmployeeProfile(i)}
                              className="text-left hover:text-blue-500 transition-colors"
                            >
                              {row.number}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.short}</td>
                          <td className="px-4 py-3">
                            {row.sip === 'Online' ? (
                              <span className="inline-flex w-6 h-6 rounded-full bg-green-100 items-center justify-center">
                                <Check size={14} className="text-green-600" strokeWidth={2.5} />
                              </span>
                            ) : (
                              <span className="inline-flex w-6 h-6 rounded-full bg-red-100 items-center justify-center">
                                <X size={14} className="text-red-500" strokeWidth={2.5} />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.minutes}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.dept}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.role}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{row.contract}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {row.services.includes('recording') && (
                                <span className="inline-flex w-7 h-7 rounded-lg bg-gray-100 items-center justify-center" title="Запись разговора">
                                  <Mic size={15} className="text-gray-600" strokeWidth={1.8} />
                                </span>
                              )}
                              {row.services.includes('callcenter') && (
                                <span className="inline-flex w-7 h-7 rounded-lg bg-gray-100 items-center justify-center" title="Колл-центр">
                                  <Headphones size={15} className="text-gray-600" strokeWidth={1.8} />
                                </span>
                              )}
                              {row.services.includes('voicemail') && (
                                <span className="inline-flex w-7 h-7 rounded-lg bg-gray-100 items-center justify-center" title="Голосовая почта">
                                  <Voicemail size={15} className="text-gray-600" strokeWidth={1.8} />
                                </span>
                              )}
                              {row.services.length === 0 && <span className="text-sm text-gray-400">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* ═══════════════════════════════════════════════════════
             SETTINGS PAGE
             ═══════════════════════════════════════════════════════ */
          <main className="flex-1 p-8 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-8">Настройки АТС</h1>

              {/* ─── Tabs ──────────────────────────── */}
              <div className="flex gap-8 border-b border-gray-200 mb-8">
                {tabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                      activeTab === idx
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                    {activeTab === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Профиль компании</h2>
                <div className="relative" ref={howItWorksRef}>
                  <button
                    onClick={() => { setHowItWorksOpen(!howItWorksOpen); setHowItWorksStep(0) }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,102,204,0.12)] transition-all duration-200"
                  >
                    Как это работает
                    <CircleHelp size={15} strokeWidth={1.8} />
                  </button>

                  {/* ─── Popover: Как это работает (2 slides) ────────── */}
                  {howItWorksOpen && (
                    <div className="absolute right-0 top-[44px] w-[360px] bg-[#1F1F1F] rounded-lg z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      {/* Arrow */}
                      <div className="absolute -top-[6px] right-[40px] w-3 h-3 bg-[#1F1F1F] rotate-45 rounded-[1px]" />

                      {/* Header */}
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h4 className="text-[15px] font-semibold text-white">{howItWorksSteps[howItWorksStep].title}</h4>
                        <button
                          onClick={() => setHowItWorksOpen(false)}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <X size={16} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="px-5 pb-5">
                        <div className="overflow-hidden">
                          <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${howItWorksStep * 100}%)` }}
                          >
                            {howItWorksSteps.map((step, idx) => (
                              <div key={idx} className="w-full shrink-0">
                                {'text' in step && (
                                  <p className="text-[13px] leading-[1.5] text-gray-400">
                                    {step.text}
                                  </p>
                                )}
                                {'paragraphs' in step && step.paragraphs && (
                                  <>
                                    {step.paragraphs.map((p, pIdx) => (
                                      <p key={pIdx} className={`text-[13px] leading-[1.5] text-gray-400 ${pIdx > 0 ? 'mt-3' : ''}`}>
                                        {p}
                                      </p>
                                    ))}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-5">
                          {/* Dots */}
                          <div className="flex gap-1.5">
                            {howItWorksSteps.map((_, idx) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                  idx === howItWorksStep ? 'bg-white' : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Navigation button */}
                          {howItWorksStep === 0 ? (
                            <button
                              onClick={() => setHowItWorksStep(1)}
                              className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Далее
                            </button>
                          ) : (
                            <button
                              onClick={() => setHowItWorksStep(0)}
                              className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Назад
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── 3 Cards Grid ────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ─── Card 1: Данные о компании ──── */}
                <div className="settings-card bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Данные о компании</h3>

                  <div className="space-y-4">
                    <FloatingInput
                      label="Название компании"
                      value={card1CompanyName}
                      onChange={markCard1Dirty}
                      placeholder="Название компании"
                    />
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      className={`px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg transition-all ${
                        card1CanSave
                          ? 'hover:bg-yellow-400 cursor-pointer opacity-100'
                          : 'cursor-not-allowed opacity-40'
                      }`}
                      disabled={!card1CanSave}
                      onClick={handleSave1}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>

                {/* ─── Card 2: Контактные данные ───── */}
                <div className="settings-card bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Контактные данные</h3>

                  <div className="space-y-4">
                    <FloatingInput
                      label="Фамилия Имя Отчество*"
                      value={card2Fio}
                      onChange={markCard2Dirty}
                      placeholder="Фамилия Имя Отчество*"
                    />
                    <div className="relative" ref={phonePopoverRef}>
                      <FloatingInput
                        label="Номер телефона *"
                        value={card2Phone}
                        onChange={markCard2PhoneDirty}
                        placeholder="Номер телефона *"
                        rightIcon
                        mask="phone"
                      />
                      <button
                        onClick={() => setPhonePopoverOpen(!phonePopoverOpen)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${phonePopoverOpen ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Info size={18} />
                      </button>

                      {/* ─── Popover: Номер телефона ────────── */}
                      {phonePopoverOpen && (
                        <div className="absolute right-0 top-[52px] w-[340px] bg-[#1F1F1F] text-white rounded-lg p-4 z-50 shadow-lg">
                          <div className="absolute -top-[6px] right-[12px] w-3 h-3 bg-[#1F1F1F] rotate-45 rounded-[1px]" />
                          <p className="text-[13px] leading-[1.5] text-gray-200">
                            Номер не должен содержать буквы и превышать 18 символов (формат +7 XXX XXX-XX-XX для российских номеров). Для международных номеров необходимо ввести код страны после префикса &quot;+&quot;.
                          </p>
                        </div>
                      )}
                    </div>
                    <FloatingInput
                      label="Контактная почта"
                      value={card2Email}
                      onChange={markCard2EmailDirty}
                      placeholder="Контактная почта"
                      type="email"
                    />

                    {/* Checkbox */}
                    <div className="flex items-start gap-3 pt-1">
                      <button
                        onClick={() => { setCheckboxConsent(!checkboxConsent); setCard2Dirty(true) }}
                        className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                          checkboxConsent
                            ? 'bg-yellow-300 border-yellow-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {checkboxConsent && <Check size={12} className="text-gray-900" strokeWidth={3} />}
                      </button>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        Соглашаюсь на <a href="#" className="text-blue-500 hover:text-blue-600">обработку данных</a> и получение уведомлений
                        <span className="relative inline-flex ml-1 align-middle" ref={consentPopoverRef}>
                          <button
                            onClick={() => setConsentPopoverOpen(!consentPopoverOpen)}
                            className={`transition-colors ${consentPopoverOpen ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            <Info size={14} />
                          </button>

                          {/* ─── Popover: Согласие на обработку данных ────────── */}
                          {consentPopoverOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-[22px] w-[320px] bg-[#1F1F1F] text-white rounded-lg p-4 z-50 shadow-lg">
                              <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1F1F1F] rotate-45 rounded-[1px]" />
                              <p className="text-[13px] leading-[1.5] text-gray-200">
                                Вы будете получать уведомления об обновлении сервиса, событиях вашей АТС, системные уведомления
                              </p>
                            </div>
                          )}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      className={`px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg transition-all ${
                        card2CanSave
                          ? 'hover:bg-yellow-400 cursor-pointer opacity-100'
                          : 'cursor-not-allowed opacity-40'
                      }`}
                      disabled={!card2CanSave}
                      onClick={handleSave2}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>

                {/* ─── Card 3: Права доступа ────────── */}
                <div className="settings-card bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Права доступа</h3>

                  <div className="space-y-4">
                    <FloatingInput
                      label="Почта для получения пароля*"
                      value={card3PasswordEmail}
                      onChange={markCard3EmailDirty}
                      placeholder="Почта для получения пароля*"
                      type="email"
                    />

                    <div className="relative" ref={popoverRef}>
                      <FloatingInput
                        label="Личный номер для входа по Mobile ID"
                        value={card3MobileId}
                        onChange={markCard3MobileIdDirty}
                        placeholder="Личный номер для входа по Mobile ID"
                        rightIcon
                        mask="phone"
                      />
                      <button
                        onClick={togglePopover}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${popoverOpen ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Info size={18} />
                      </button>

                      {/* ─── Popover: Mobile ID ────────── */}
                      {popoverOpen && (
                        <div className="absolute right-0 top-[52px] w-[340px] bg-[#1F1F1F] text-white rounded-lg p-4 z-50 shadow-lg">
                          {/* Arrow */}
                          <div className="absolute -top-[6px] right-[12px] w-3 h-3 bg-[#1F1F1F] rotate-45 rounded-[1px]" />

                          {/* Content */}
                          <div className="text-[13px] leading-[1.5] text-gray-200">
                            <p>Mobile ID — это защищённый способ входа по номеру телефона без пароля. Мы отправляем Push-уведомление прямо на ваш телефон.</p>

                            <ul className="mt-3 space-y-1 pl-1">
                              <li className="flex gap-2">
                                <span className="shrink-0">•</span>
                                <span>введите свой номер телефона при авторизации</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="shrink-0">•</span>
                                <span>на телефоне появится Push-уведомление</span>
                              </li>
                              <li className="flex gap-2">
                                <span className="shrink-0">•</span>
                                <span>для подтверждения нажмите «Разрешить»</span>
                              </li>
                            </ul>

                            <p className="mt-3">
                              Если ваше устройство не поддерживает Push или вы не успели подтвердить вход в течение 30 секунд, вам автоматически придет SMS со ссылкой для подтверждения
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle 2FA */}
                    <div className="flex items-start gap-3 pt-2">
                      <div
                        onClick={handleToggle2FA}
                        className={`toggle-track shrink-0 mt-0.5 ${toggle2FA ? 'active' : ''}`}
                      >
                        <div className="toggle-thumb" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Двухфакторная аутентификация</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Вам будет отправляться проверочный код для входа – это дополнительная защита вашего аккаунта
                        </p>
                      </div>
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center justify-between pt-1">
                      <button className="text-sm text-blue-500 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,102,204,0.12)] transition-all duration-200">
                        Изменить пароль
                      </button>
                      <button
                        className={`px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg transition-all ${
                          card3CanSave
                            ? 'hover:bg-yellow-400 cursor-pointer opacity-100'
                            : 'cursor-not-allowed opacity-40'
                        }`}
                        disabled={!card3CanSave}
                        onClick={handleSave3}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : currentPage === 'employee-profile' ? (
          /* ═══════════════════════════════════════════════════════
             EMPLOYEE PROFILE PAGE
             ═══════════════════════════════════════════════════════ */
          <main className="flex-1 p-8 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm mb-6">
                <button onClick={() => setCurrentPage('home')} className="text-gray-500 hover:text-gray-700 transition-colors">Номера</button>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium">Профиль {emp.number}</span>
              </nav>

              {/* Profile header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-semibold text-gray-900">Профиль {emp.number}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Активен
                  </span>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} strokeWidth={1.8} />
                  Удалить сотрудника
                </button>
              </div>
              <p className="text-sm text-gray-500 -mt-6 mb-8">{emp.name}</p>

              {/* ─── Two cards row ──────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Card: Контактные данные */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Контактные данные</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Телефон</span>
                      <span className="text-sm text-gray-900 font-medium">{empShortNumber.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2-$3-$4')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Короткий номер</span>
                      <span className="text-sm text-gray-900">{emp.short}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Имя и фамилия</span>
                      <span className="text-sm text-gray-900">{emp.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Контактная почта</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-900">{emp.email}</span>
                        <Info size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Подразделение</span>
                      <span className="text-sm text-gray-900">{emp.dept}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Должность</span>
                      <span className="text-sm text-gray-900">{emp.position}</span>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,102,204,0.12)] transition-all duration-200">
                      <Pencil size={14} strokeWidth={1.8} />
                      Редактировать
                    </button>
                  </div>
                </div>

                {/* Card: Права доступа */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Права доступа</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Доступ к личному кабинету</span>
                      <span className="text-sm text-gray-900">Включен</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Роль</span>
                      <span className="text-sm text-gray-900">{emp.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Двухфакторная аутентификация</span>
                      <span className="text-sm text-gray-400">Выключена</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Почта для получения пароля</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-900">{emp.email}</span>
                        <Info size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Номер для входа по Mobile ID</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-400">{empMobileId ? formatPhoneMask(empMobileId) : '—'}</span>
                        <Info size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">Сбросить пароль</button>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleGoToEmployeeEditRights}
                      className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:shadow-[0_2px_8px_rgba(0,102,204,0.12)] transition-all duration-200"
                    >
                      <Pencil size={14} strokeWidth={1.8} />
                      Редактировать
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Настройки сотрудника ──────────── */}
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Настройки сотрудника</h2>
              <div className="space-y-4 mb-8">
                {[
                  { on: true, title: 'Активация SIP', desc: 'Принимайте и совершайте звонки через интернет' },
                  { on: false, title: 'Переадресация', desc: 'Переводите входящие звонки на другой номер' },
                  { on: false, title: 'Чёрные и белые списки', desc: 'Списки запрещенных и разрешенных абонентов' },
                  { on: false, title: 'Голосовая почта', desc: 'Автоответчик сотрудника' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`toggle-track shrink-0 ${item.on ? 'active' : ''}`}
                      >
                        <div className="toggle-thumb" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">Настроить</button>
                  </div>
                ))}
              </div>

              {/* ─── Услуги ──────────────────── */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Услуги, к которым подключен сотрудник{emp.services.length > 0 && ` (${emp.services.length})`}
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-900">Тип услуги</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-900">Название услуги</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-900">Многоканальный номер</th>
                      <th className="w-10 px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {emp.services.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-sm text-gray-400 text-center">Нет подключенных услуг</td></tr>
                    )}
                    {emp.services.includes('recording') && (
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-700">Запись разговора</td>
                        <td className="px-5 py-3 text-sm text-gray-700">Запись разговоров</td>
                        <td className="px-5 py-3 text-sm text-gray-900 font-medium">{emp.number}</td>
                        <td className="px-5 py-3"><Info size={16} className="text-gray-400" /></td>
                      </tr>
                    )}
                    {emp.services.includes('voicemail') && (
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm text-gray-700">Голосовая почта</td>
                        <td className="px-5 py-3 text-sm text-gray-700">Голосовая почта</td>
                        <td className="px-5 py-3 text-sm text-gray-900 font-medium">{emp.number}</td>
                        <td className="px-5 py-3"><Info size={16} className="text-gray-400" /></td>
                      </tr>
                    )}
                    {emp.services.includes('callcenter') && (
                      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3"><Headphones size={16} className="text-gray-600" /></td>
                        <td className="px-5 py-3 text-sm text-gray-700">Колл-центр</td>
                        <td className="px-5 py-3 text-sm text-gray-900 font-medium">{emp.number}</td>
                        <td className="px-5 py-3"><Info size={16} className="text-gray-400" /></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        ) : currentPage === 'employee-edit-rights' ? (
          /* ═══════════════════════════════════════════════════════
             EMPLOYEE EDIT RIGHTS PAGE
             ═══════════════════════════════════════════════════════ */
          <main className="flex-1 p-8 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm mb-6">
                <button onClick={() => setCurrentPage('home')} className="text-gray-500 hover:text-gray-700 transition-colors">Номера</button>
                <ChevronRight size={14} className="text-gray-400" />
                <button onClick={() => setCurrentPage('employee-profile')} className="text-gray-500 hover:text-gray-700 transition-colors">Профиль {emp.number}</button>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium">Права доступа</span>
              </nav>

              {/* Page header */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Права доступа профиля {emp.number}</h1>
              <p className="text-sm text-gray-500 mb-8">{emp.name}</p>

              <div className="max-w-[640px]">
                {/* Email field (read-only display) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Почта для получения пароля*</label>
                  <div className="relative">
                    <div className="w-full h-[48px] px-4 pr-10 bg-gray-100 rounded-lg text-sm text-gray-900 border-[1.5px] border-transparent flex items-center">
                      {emp.email}
                    </div>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Используется для доступа в ОАТС</p>
                </div>

                {/* Mobile ID inline edit */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Номер для входа по Mobile ID</label>
                  <div className="relative">
                    <div
                      className="w-full h-[48px] px-4 pr-20 bg-white rounded-lg text-sm text-gray-900 border-[1.5px] border-gray-900 focus-within:border-gray-900 flex items-center"
                    >
                      <input
                        type="text"
                        value={formatPhoneMask(empMobileIdDisplay)}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '')
                          const raw = digits.length > 0 && (digits[0] === '7' || digits[0] === '8') ? digits.slice(1) : digits
                          setEmpMobileIdDisplay(raw.slice(0, 10))
                        }}
                        placeholder=""
                        className="flex-1 h-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      />
                      {empMobileIdDisplay && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleEmpMobileIdCheck}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-green-600"
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setEmpMobileIdDisplay('')}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-400"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                    На указанный номер при авторизации придёт Push-уведомление для подтверждения нужно нажать «Разрешить»
                  </p>
                </div>

                {/* Role dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Роль доступа</label>
                  <div className="relative">
                    <select className="w-full h-[48px] px-4 pr-10 bg-gray-100 rounded-lg text-sm text-gray-900 border-[1.5px] border-transparent focus:border-gray-900 focus:bg-white focus:outline-none appearance-none cursor-pointer">
                      <option>Сотрудник</option>
                      <option>Администратор</option>
                      <option>Оператор</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => setEmpToggleAccess(!empToggleAccess)}
                      className={`toggle-track shrink-0 mt-0.5 ${empToggleAccess ? 'active' : ''}`}
                    >
                      <div className="toggle-thumb" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">Разрешить доступ к личному кабинету АТС</p>
                        <Info size={14} className="text-gray-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => setEmpToggle2FA(!empToggle2FA)}
                      className={`toggle-track shrink-0 mt-0.5 ${empToggle2FA ? 'active' : ''}`}
                    >
                      <div className="toggle-thumb" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">Включить двухфакторную аутентификацию</p>
                        <Info size={14} className="text-gray-400 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setCurrentPage('employee-profile')}
                  className="bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg px-6 py-2.5 hover:bg-yellow-400 transition-colors"
                >
                  Закрыть окно
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          NEW FEATURE DIALOG
          ═══════════════════════════════════════════════════════════ */}
      {showNewFeatureDialog && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-[520px] w-full mx-4 p-8">
            <h3 className="text-lg font-semibold text-gray-900">Новый функционал</h3>

            <div className="mt-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Smartphone size={22} className="text-green-600" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Mobile ID — это защищённый способ входа по номеру телефона без паролей. Мы отправляем Push-уведомление прямо на ваш телефон.
                </p>

                <ul className="mt-4 space-y-2">
                  <li className="flex gap-2 text-sm text-gray-600">
                    <span className="shrink-0">•</span>
                    <span>введите свой номер телефона при авторизации</span>
                  </li>
                  <li className="flex gap-2 text-sm text-gray-600">
                    <span className="shrink-0">•</span>
                    <span>на телефоне появится Push-уведомление</span>
                  </li>
                  <li className="flex gap-2 text-sm text-gray-600">
                    <span className="shrink-0">•</span>
                    <span>для подтверждения нажимайте «Разрешить»</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="mt-5 text-xs text-gray-500 leading-relaxed">
              Если ваше устройство не поддерживает Push или вы не успели подтвердить вход в течение 30 секунд, вам автоматически придёт SMS со ссылкой для подтверждения
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNewFeatureDialog(false)}
                className="bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg px-6 py-2.5 hover:bg-yellow-400 transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PUSH CONFIRMATION DIALOG
          ═══════════════════════════════════════════════════════════ */}
      {showPushDialog && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-[540px] w-full mx-4 p-8">
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              Мы отправили запрос подтверждения на указанный номер {formatPhoneMask(card3MobileId)}
            </h3>

            <div className="mt-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                Чтобы использовать этот номер для входа в личный кабинет, откройте уведомление и нажмите «Подтвердить».
              </p>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                Запрос придет в виде Push-уведомления или SMS. Если вы не получили уведомление, отправьте запрос повторно или попробуйте позже.
              </p>
            </div>

            {/* Simulate push confirm */}
            <button
              onClick={handlePushSimulate}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✓ Подтвердить пуш (симуляция)
            </button>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handlePushCancel}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Отменить изменения
              </button>
              <button
                onClick={handlePushResend}
                disabled={pushTimer > 0}
                className={`bg-yellow-300 text-gray-900 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                  pushTimer > 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-yellow-400 cursor-pointer'
                }`}
              >
                Отправить повторно: {pushTimer} сек
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          EMPLOYEE PUSH CONFIRMATION DIALOG
          ═══════════════════════════════════════════════════════════ */}
      {showEmpPushDialog && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-[540px] w-full mx-4 p-8">
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              Мы отправили запрос подтверждения на указанный номер {formatPhoneMask(empMobileIdDisplay)}
            </h3>

            <div className="mt-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                Чтобы использовать этот номер для входа в личный кабинет, откройте уведомление и нажмите «Подтвердить».
              </p>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                Запрос придет в виде Push-уведомления или SMS. Если вы не получили уведомление, отправьте запрос повторно или попробуйте позже.
              </p>
            </div>

            {/* Simulate push confirm */}
            <button
              onClick={handleEmpPushSimulate}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✓ Подтвердить пуш (симуляция)
            </button>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleEmpPushCancel}
                className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Отменить изменения
              </button>
              <button
                onClick={handleEmpPushResend}
                disabled={empPushTimer > 0}
                className={`bg-yellow-300 text-gray-900 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                  empPushTimer > 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-yellow-400 cursor-pointer'
                }`}
              >
                Отправить повторно: {empPushTimer} сек
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Snackbar ──────────────────────────── */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          snackbarOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#1F1F1F] text-white text-sm font-medium px-6 py-3 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          {snackbarMessage}
        </div>
      </div>
    </div>
  )
}
