import { useEffect, useMemo, useState } from 'react';
import { settingsApi } from '@/lib/api';
import type { BookingEmailConfig, BookingEmailTemplates, Setting } from '@/lib/api/settings';

type TabKey = 'general' | 'booking_email';
type TemplateTabKey = 'customer_confirmation' | 'admin_notification' | 'customer_reminder';

interface BookingEmailFormState {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpReplyTo: string;
  adminBookingNotificationEnabled: boolean;
  adminBookingNotificationEmails: string;
  reminderEnabled: boolean;
  reminderLeadHours: number;
  emailTemplates: BookingEmailTemplates;
}

const REMINDER_PRESETS = [
  { label: '3 hours before', value: 3 },
  { label: '6 hours before', value: 6 },
  { label: '12 hours before', value: 12 },
  { label: '24 hours before (1 day)', value: 24 }
];

const TEMPLATE_TABS: Array<{
  id: TemplateTabKey;
  label: string;
  templateKey: keyof BookingEmailTemplates;
}> = [
  { id: 'customer_confirmation', label: 'Customer confirmation', templateKey: 'customerBookingCreated' },
  { id: 'admin_notification', label: 'Admin notification', templateKey: 'adminBookingCreated' },
  { id: 'customer_reminder', label: 'Customer reminder', templateKey: 'customerBookingReminder' }
];

const defaultEmailTemplates: BookingEmailTemplates = {
  customerBookingCreated: {
    subject: '[Aurelian Seafood] Xác nhận đặt bàn thành công',
    body: [
      'Xin chào {{customer_name}},',
      '',
      'Cảm ơn bạn đã đặt bàn tại {{restaurant_name}}.',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}',
      '',
      'Chúng tôi sẽ liên hệ nếu cần xác nhận thêm thông tin.',
      'Hẹn gặp bạn tại nhà hàng.'
    ].join('\n')
  },
  adminBookingCreated: {
    subject: '[Booking mới] {{customer_name}} - {{reservation_datetime}}',
    body: [
      'Có booking mới trên hệ thống.',
      'Khách hàng: {{customer_name}}',
      'Email: {{customer_email}}',
      'Điện thoại: {{customer_phone}}',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}'
    ].join('\n')
  },
  customerBookingReminder: {
    subject: '[Aurelian Seafood] Nhắc lịch đặt bàn sau {{lead_hours}} giờ',
    body: [
      'Xin chào {{customer_name}},',
      '',
      'Bạn có lịch đặt bàn sau {{lead_hours}} giờ.',
      'Thời gian: {{reservation_datetime}}',
      'Số khách: {{party_size}}',
      'Ghi chú: {{special_requests}}',
      '',
      'Hẹn gặp bạn tại nhà hàng.'
    ].join('\n')
  }
};

const emptyBookingForm: BookingEmailFormState = {
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  smtpReplyTo: '',
  adminBookingNotificationEnabled: false,
  adminBookingNotificationEmails: '',
  reminderEnabled: true,
  reminderLeadHours: 24,
  emailTemplates: defaultEmailTemplates
};

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState<TabKey>('booking_email');
  const [activeTemplateTab, setActiveTemplateTab] = useState<TemplateTabKey>('customer_confirmation');

  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);

  const [bookingConfig, setBookingConfig] = useState<BookingEmailConfig | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingEmailFormState>(emptyBookingForm);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [savingBooking, setSavingBooking] = useState(false);
  const [testingBooking, setTestingBooking] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    loadGeneralSettings();
    loadBookingEmailConfig();
  }, []);

  const loadGeneralSettings = async () => {
    try {
      setLoadingGeneral(true);
      const response = await settingsApi.getAll();
      const filtered = response.filter((item) => item.key !== 'booking_email_config');
      setSettings(filtered);
      const initial: Record<string, string> = {};
      filtered.forEach((setting) => {
        initial[setting.key] = setting.value || '';
      });
      setEditedSettings(initial);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoadingGeneral(false);
    }
  };

  const loadBookingEmailConfig = async () => {
    try {
      setLoadingBooking(true);
      const config = await settingsApi.getBookingEmailConfig();
      setBookingConfig(config);
      setBookingForm({
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort || 587,
        smtpSecure: Boolean(config.smtpSecure),
        smtpUser: config.smtpUser || '',
        smtpPass: '',
        smtpFrom: config.smtpFrom || '',
        smtpReplyTo: config.smtpReplyTo || '',
        adminBookingNotificationEnabled: Boolean(config.adminBookingNotificationEnabled),
        adminBookingNotificationEmails: (config.adminBookingNotificationEmails || []).join(', '),
        reminderEnabled: Boolean(config.reminderEnabled),
        reminderLeadHours: config.reminderLeadHours || 24,
        emailTemplates: config.emailTemplates || defaultEmailTemplates
      });
    } catch (error) {
      console.error('Failed to load booking email settings:', error);
    } finally {
      setLoadingBooking(false);
    }
  };

  const groupedSettings = useMemo(() => {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.group]) acc[setting.group] = [];
      acc[setting.group].push(setting);
      return acc;
    }, {} as Record<string, Setting[]>);
  }, [settings]);

  const handleGeneralChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateEmailTemplate = (
    templateKey: keyof BookingEmailTemplates,
    field: 'subject' | 'body',
    value: string
  ) => {
    setBookingForm((prev) => ({
      ...prev,
      emailTemplates: {
        ...prev.emailTemplates,
        [templateKey]: {
          ...prev.emailTemplates[templateKey],
          [field]: value
        }
      }
    }));
  };

  const saveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingGeneral(true);
      await settingsApi.update({
        settings: settings.map((setting) => ({
          key: setting.key,
          value: editedSettings[setting.key] || '',
          group: setting.group
        }))
      });
      alert('General settings updated successfully');
      await loadGeneralSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.message || 'Unable to save settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveBookingEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBooking(true);
      const payload = {
        smtpHost: bookingForm.smtpHost.trim(),
        smtpPort: bookingForm.smtpPort,
        smtpSecure: bookingForm.smtpSecure,
        smtpUser: bookingForm.smtpUser.trim(),
        smtpPass: bookingForm.smtpPass,
        smtpFrom: bookingForm.smtpFrom.trim(),
        smtpReplyTo: bookingForm.smtpReplyTo.trim(),
        adminBookingNotificationEnabled: bookingForm.adminBookingNotificationEnabled,
        adminBookingNotificationEmails: bookingForm.adminBookingNotificationEmails,
        reminderEnabled: bookingForm.reminderEnabled,
        reminderLeadHours: bookingForm.reminderLeadHours,
        emailTemplates: bookingForm.emailTemplates
      };

      const updated = await settingsApi.updateBookingEmailConfig(payload);
      setBookingConfig(updated);
      setBookingForm((prev) => ({
        ...prev,
        smtpPass: '',
        adminBookingNotificationEmails: (updated.adminBookingNotificationEmails || []).join(', '),
        emailTemplates: updated.emailTemplates || defaultEmailTemplates
      }));
      setTestResult('');
      alert('Booking email settings updated successfully');
    } catch (error: any) {
      console.error('Failed to save booking email settings:', error);
      alert(error.response?.data?.message || 'Unable to save booking email settings');
    } finally {
      setSavingBooking(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert('Please enter a test email');
      return;
    }

    try {
      setTestingBooking(true);
      setTestResult('');
      const result = await settingsApi.testBookingEmailConfig(testEmail.trim());
      if (result.sent) {
        setTestResult(`Test email sent to ${testEmail.trim()}`);
      } else {
        setTestResult(`Failed to send test email: ${result.reason || 'unknown'}`);
      }
    } catch (error: any) {
      setTestResult(error.response?.data?.message || 'Unable to send test email');
    } finally {
      setTestingBooking(false);
    }
  };

  const tabClass = (tab: TabKey) => (
    `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      activeTab === tab
        ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
        : 'text-amber-100/70 hover:text-amber-200 hover:bg-amber-300/10'
    }`
  );

  const activeTemplateConfig = TEMPLATE_TABS.find((item) => item.id === activeTemplateTab) || TEMPLATE_TABS[0];

  return (
    <div className="space-y-6">
      <div className="card-glass rounded-2xl border border-amber-300/20 p-3 inline-flex gap-2">
        <button type="button" onClick={() => setActiveTab('booking_email')} className={tabClass('booking_email')}>
          Booking Email
        </button>
        <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>
          General Settings
        </button>
      </div>

      {activeTab === 'booking_email' && (
        <form onSubmit={saveBookingEmailSettings} className="space-y-6">
          {loadingBooking ? (
            <div className="card-glass rounded-2xl border border-amber-300/20 p-8 text-amber-100/80">
              Loading booking email settings...
            </div>
          ) : (
            <>
              <div className="card-glass rounded-2xl border border-amber-300/20 p-6 space-y-4">
                <h3 className="text-xl font-semibold text-amber-100">SMTP account</h3>
                <p className="text-sm text-amber-200/70">
                  Customers always receive a booking confirmation email. Admin notifications can be turned on or off.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">SMTP host</span>
                    <input
                      value={bookingForm.smtpHost}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpHost: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                      placeholder="smtp.gmail.com"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">SMTP port</span>
                    <input
                      type="number"
                      min={1}
                      max={65535}
                      value={bookingForm.smtpPort}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpPort: Number(e.target.value) || 587 }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">SMTP user</span>
                    <input
                      value={bookingForm.smtpUser}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpUser: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">SMTP password</span>
                    <input
                      type="password"
                      value={bookingForm.smtpPass}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpPass: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                      placeholder={bookingConfig?.smtpHasPassword ? 'Leave blank to keep current password' : 'Enter SMTP password'}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">From email</span>
                    <input
                      value={bookingForm.smtpFrom}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpFrom: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                      placeholder="booking@domain.com"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-amber-100">Reply-to (optional)</span>
                    <input
                      value={bookingForm.smtpReplyTo}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpReplyTo: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-3 text-amber-100">
                  <input
                    type="checkbox"
                    checked={bookingForm.smtpSecure}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, smtpSecure: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Use secure connection (SMTPS)
                </label>
              </div>

              <div className="card-glass rounded-2xl border border-amber-300/20 p-6 space-y-4">
                <h3 className="text-xl font-semibold text-amber-100">Booking notifications</h3>
                <label className="flex items-center gap-3 text-amber-100">
                  <input
                    type="checkbox"
                    checked={bookingForm.adminBookingNotificationEnabled}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, adminBookingNotificationEnabled: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Notify admin when a new booking is created
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm text-amber-100">Admin email list (comma separated)</span>
                  <textarea
                    rows={3}
                    value={bookingForm.adminBookingNotificationEmails}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, adminBookingNotificationEmails: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    placeholder="admin1@example.com, admin2@example.com"
                  />
                </label>

                <label className="flex items-center gap-3 text-amber-100">
                  <input
                    type="checkbox"
                    checked={bookingForm.reminderEnabled}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, reminderEnabled: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  Enable customer meal reminder emails
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm text-amber-100">Reminder schedule</span>
                  <select
                    value={bookingForm.reminderLeadHours}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, reminderLeadHours: Number(e.target.value) || 24 }))}
                    className="w-full md:w-80 px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                  >
                    {REMINDER_PRESETS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="card-glass rounded-2xl border border-amber-300/20 p-6 space-y-5">
                <h3 className="text-xl font-semibold text-amber-100">Email templates</h3>
                <p className="text-sm text-amber-200/70">
                  You can customize content in any language. Available placeholders:
                  <code className="ml-2 text-amber-200">
                    {'{{customer_name}} {{reservation_datetime}} {{party_size}} {{special_requests}} {{customer_email}} {{customer_phone}} {{lead_hours}} {{restaurant_name}}'}
                  </code>
                </p>

                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTemplateTab(tab.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTemplateTab === tab.id
                          ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                          : 'text-amber-100/70 border border-amber-300/20 hover:text-amber-200 hover:bg-amber-300/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-100 font-medium">{activeTemplateConfig.label}</h4>
                  <input
                    value={bookingForm.emailTemplates[activeTemplateConfig.templateKey].subject}
                    onChange={(e) => updateEmailTemplate(activeTemplateConfig.templateKey, 'subject', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    placeholder="Email subject"
                  />
                  <textarea
                    rows={9}
                    value={bookingForm.emailTemplates[activeTemplateConfig.templateKey].body}
                    onChange={(e) => updateEmailTemplate(activeTemplateConfig.templateKey, 'body', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    placeholder="Email body"
                  />
                </div>
              </div>

              <div className="card-glass rounded-2xl border border-amber-300/20 p-6 space-y-4">
                <h3 className="text-xl font-semibold text-amber-100">Test SMTP</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                    placeholder="email-test@example.com"
                  />
                  <button
                    type="button"
                    onClick={sendTestEmail}
                    disabled={testingBooking}
                    className="px-4 py-2 rounded-lg border border-amber-300/40 text-amber-100 hover:bg-amber-400/15 disabled:opacity-60"
                  >
                    {testingBooking ? 'Sending...' : 'Send test email'}
                  </button>
                </div>
                {testResult && <p className="text-sm text-amber-200/80">{testResult}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold disabled:opacity-60"
                >
                  {savingBooking ? 'Saving...' : 'Save Booking Email Settings'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {activeTab === 'general' && (
        <form onSubmit={saveGeneralSettings} className="space-y-6">
          {loadingGeneral ? (
            <div className="card-glass rounded-2xl border border-amber-300/20 p-8 text-amber-100/80">
              Loading general settings...
            </div>
          ) : (
            <>
              {Object.entries(groupedSettings).map(([group, groupSettings]) => (
                <div key={group} className="card-glass rounded-2xl border border-amber-300/20 p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-amber-100 capitalize">
                    {group.replace('_', ' ')} settings
                  </h3>
                  {groupSettings.map((setting) => (
                    <div key={setting.key}>
                      <label className="block text-sm text-amber-200/80 mb-2">
                        {setting.key.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                      {setting.key.includes('description') || setting.key.includes('address') ? (
                        <textarea
                          rows={3}
                          value={editedSettings[setting.key] || ''}
                          onChange={(e) => handleGeneralChange(setting.key, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                        />
                      ) : (
                        <input
                          value={editedSettings[setting.key] || ''}
                          onChange={(e) => handleGeneralChange(setting.key, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-amber-300/25 text-amber-50"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingGeneral}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold disabled:opacity-60"
                >
                  {savingGeneral ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}
