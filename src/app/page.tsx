'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Bell, User, Info, Moon, Settings, Users, Calendar, 
  ShoppingCart, Zap, BarChart3, Folder, Phone, HelpCircle,
  Mail, Menu, MoreVertical, Check, CircleHelp
} from 'lucide-react'

// ─── Floating Label Input ─────────────────────────────
function FloatingInput({ 
  label, 
  value, 
  placeholder, 
  type = 'text',
  readOnly = false,
  rightIcon = false,
}: { 
  label: string
  value?: string
  placeholder?: string
  type?: string
  readOnly?: boolean
  rightIcon?: boolean
}) {
  const hasValue = !!value
  const pr = rightIcon ? 'pr-10' : 'pr-4'
  
  return (
    <div className="relative">
      <input
        type={type}
        defaultValue={value}
        placeholder={hasValue ? ' ' : (placeholder || label)}
        className={`w-full h-[48px] px-4 ${pr} ${hasValue ? 'pt-[12px]' : ''} bg-gray-100 rounded-lg text-sm text-gray-900 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-colors placeholder:text-gray-400 ${readOnly ? 'cursor-default' : ''}`}
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
  { icon: Menu, label: 'Меню', active: true, isBurger: true },
  { icon: Users, label: 'Пользователи', active: false },
  { icon: Calendar, label: 'Календарь', active: false },
  { icon: ShoppingCart, label: 'Магазин', active: false },
  { icon: Zap, label: 'Быстрые действия', active: false },
  { icon: BarChart3, label: 'Аналитика', active: false },
  { icon: Folder, label: 'Файлы', active: false },
  { icon: Phone, label: 'Звонки', active: false },
  { icon: Settings, label: 'Настройки', active: false, settingsActive: true },
  { icon: HelpCircle, label: 'Справка', active: false },
  { icon: Mail, label: 'Почта', active: false },
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
  const [activeTab, setActiveTab] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toggle2FA, setToggle2FA] = useState(false)
  const [checkboxConsent, setCheckboxConsent] = useState(true)
  const [showNotificationBadge, setShowNotificationBadge] = useState(true)
  const [scenarioStep, setScenarioStep] = useState<'idle' | 'notification-open' | 'settings-page'>('idle')
  const notifRef = useRef<HTMLDivElement>(null)

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
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="w-[72px] min-h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        {sidebarIcons.map((item, idx) => {
          const Icon = item.icon
          const isActive = item.active
          const isSettingsActive = item.settingsActive
          const isBurger = item.isBurger
          return (
            <button
              key={idx}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                isBurger
                  ? 'text-gray-900'
                  : isSettingsActive
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                  : isActive
                  ? 'bg-gray-100 text-gray-900 border-l-[3px] border-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
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

                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
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
                          className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Перейти в профиль
                        </button>
                      </div>
                    </div>
                    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r" />
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
              <button className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1.5">
                Как это работает
                <CircleHelp size={15} strokeWidth={1.8} />
              </button>
            </div>

            {/* ─── 3 Cards Grid ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ─── Card 1: Данные о компании ──── */}
              <div className="settings-card bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-5">Данные о компании</h3>
                
                <div className="space-y-4">
                  <FloatingInput
                    label="Название компании"
                    value='ООО «Феникс-Инвестстрой»'
                    placeholder="Название компании"
                    readOnly
                  />
                </div>

                <div className="mt-5 flex justify-end">
                  <button className="px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg cursor-not-allowed opacity-40" disabled>
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
                    placeholder="Фамилия Имя Отчество*"
                  />
                  <div className="relative">
                    <FloatingInput
                      label="Номер телефона *"
                      placeholder="Номер телефона *"
                      rightIcon
                    />
                    <Info size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <FloatingInput
                    label="Контактная почта"
                    value="pasterpanenko@mail.ru"
                    placeholder="Контактная почта"
                    type="email"
                    readOnly
                  />
                  
                  {/* Checkbox */}
                  <div className="flex items-start gap-3 pt-1">
                    <button
                      onClick={() => setCheckboxConsent(!checkboxConsent)}
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
                      <Info size={14} className="inline ml-1 text-gray-400 align-middle" />
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button className="px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg cursor-not-allowed opacity-40" disabled>
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
                    value="pasterpanenko@mail.ru"
                    placeholder="Почта для получения пароля*"
                    type="email"
                    readOnly
                  />
                  
                  <div className="relative">
                    <FloatingInput
                      label="Личный номер для входа по Mobile ID"
                      placeholder="Личный номер для входа по Mobile ID"
                      rightIcon
                    />
                    <Info size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Toggle 2FA */}
                  <div className="flex items-start gap-3 pt-2">
                    <div
                      onClick={() => setToggle2FA(!toggle2FA)}
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
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                      Изменить пароль
                    </button>
                    <button className="px-6 py-2.5 bg-yellow-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors cursor-not-allowed opacity-40" disabled>
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
