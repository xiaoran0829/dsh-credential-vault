window.__ModuleLoader__.load({
  id: 'dsh-credential-vault',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace owned by this plugin. */
    const NS = 'credential-vault'

    const zh = {
      'view.label': '凭证库',
      'view.title': '凭证库',
      'view.subtitle': '密码与 API Token · 人类查看需主密码，Agent 可通过 vaultctl 查阅',
      'view.loading': '载入中…',
      'view.empty': '还没有凭证',
      'view.emptyHint': '点「新增」录入，或让 Agent 写入。',
      'view.search': '搜索名称 / 用户名 / 站点',
      'view.add': '新增',
      'view.lock': '锁定',
      'view.save': '保存',
      'view.cancel': '取消',
      'view.edit': '编辑',
      'view.delete': '删除',
      'view.confirmDelete': '确定删除「{title}」？',
      'view.reveal': '显示',
      'view.hide': '隐藏',
      'view.copy': '复制',
      'view.copied': '已复制',
      'view.history': '记录',
      'view.by': '录入方：{by}',
      'view.reminder.none': '不提醒',
      'view.reminder.7d': '提前 7 天',
      'view.reminder.3d': '提前 3 天',
      'view.reminder.on': '到期当天',
      'view.expired': '已过期 {days} 天',
      'view.expiresIn': '剩 {days} 天',
      'view.noExpiry': '无截止期',
      'view.updated': '更新于 {time}',
      'view.setupTitle': '首次使用：设置主密码',
      'view.setupHint': '这个密码只用于人类在浏览器查看凭证，至少 8 位。Agent 通过本机 CLI 查阅，不受此密码限制。',
      'view.unlockTitle': '输入主密码',
      'view.unlockHint': '凭证库已锁定。',
      'view.password': '主密码',
      'view.passwordConfirm': '再输一次',
      'view.setup': '设置并解锁',
      'view.unlock': '解锁',
      'view.changePassword': '改主密码',
      'view.currentPassword': '当前主密码',
      'view.newPassword': '新主密码',
      'view.error': '出错了',
      'view.retry': '重试',
      'view.formTitle': '名称',
      'view.formUsername': '用户名（可选）',
      'view.formSecret': '密码 / Token',
      'view.formSecretEdit': '密码 / Token（留空不修改）',
      'view.formSite': '验证地（网址 / 程序）',
      'view.formExpires': '有效截止期（可选）',
      'view.formReminder': '截止提醒',
      'view.formNote': '备注（可选）',
      'view.newEntry': '新增凭证',
      'view.editEntry': '编辑凭证',
      'view.mismatch': '两次输入不一致',
      'view.short': '主密码至少 8 位',
      'view.saved': '已保存',
      'view.entryCount': '{count} 条',
    }
    const en = {
      'view.label': 'Vault',
      'view.title': 'Credential Vault',
      'view.subtitle': 'Passwords and API tokens · humans unlock with the master password, the agent reads via vaultctl',
      'view.loading': 'Loading…',
      'view.empty': 'No credentials yet',
      'view.emptyHint': 'Add one, or let the agent write entries.',
      'view.search': 'Search title / username / site',
      'view.add': 'Add',
      'view.lock': 'Lock',
      'view.save': 'Save',
      'view.cancel': 'Cancel',
      'view.edit': 'Edit',
      'view.delete': 'Delete',
      'view.confirmDelete': 'Delete “{title}”?',
      'view.reveal': 'Reveal',
      'view.hide': 'Hide',
      'view.copy': 'Copy',
      'view.copied': 'Copied',
      'view.history': 'History',
      'view.by': 'recorded by {by}',
      'view.reminder.none': 'No reminder',
      'view.reminder.7d': '7 days before',
      'view.reminder.3d': '3 days before',
      'view.reminder.on': 'On expiry day',
      'view.expired': 'Expired {days}d ago',
      'view.expiresIn': '{days}d left',
      'view.noExpiry': 'No expiry',
      'view.updated': 'updated {time}',
      'view.setupTitle': 'First use: set the master password',
      'view.setupHint': 'This password only gates the browser view; it must be at least 8 characters. The agent reads through the local CLI without it.',
      'view.unlockTitle': 'Enter the master password',
      'view.unlockHint': 'The vault is locked.',
      'view.password': 'Master password',
      'view.passwordConfirm': 'Repeat password',
      'view.setup': 'Set and unlock',
      'view.unlock': 'Unlock',
      'view.changePassword': 'Change password',
      'view.currentPassword': 'Current password',
      'view.newPassword': 'New password',
      'view.error': 'Failed',
      'view.retry': 'Retry',
      'view.formTitle': 'Title',
      'view.formUsername': 'Username (optional)',
      'view.formSecret': 'Password / token',
      'view.formSecretEdit': 'Password / token (blank keeps the stored one)',
      'view.formSite': 'Where it is used (URL / program)',
      'view.formExpires': 'Expires on (optional)',
      'view.formReminder': 'Expiry reminder',
      'view.formNote': 'Note (optional)',
      'view.newEntry': 'New credential',
      'view.editEntry': 'Edit credential',
      'view.mismatch': 'The two passwords differ',
      'view.short': 'At least 8 characters',
      'view.saved': 'Saved',
      'view.entryCount': '{count} entries',
    }

    const CSS = [
      '.cv-root{display:flex;flex-direction:column;gap:14px;max-width:860px;width:100%;margin:0 auto;padding:20px 24px 40px;box-sizing:border-box;color:var(--dsw-alias-label-primary);font-size:13px}',
      '.cv-head{display:flex;align-items:baseline;gap:10px}',
      '.cv-title{font-size:15px;font-weight:600;margin:0;line-height:22px}',
      '.cv-count{font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.cv-spacer{flex:1}',
      '.cv-sub{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:-8px}',
      '.cv-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '.cv-input{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;padding:6px 10px;min-width:0}',
      '.cv-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.cv-input::placeholder{color:var(--dsw-alias-label-secondary)}',
      '.cv-search{flex:1;min-width:180px}',
      '.cv-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:5px 11px;cursor:pointer;white-space:nowrap}',
      '.cv-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.cv-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.cv-btn-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}',
      '.cv-btn-primary:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.cv-btn-danger{color:var(--dsw-alias-state-error-primary)}',
      '.cv-btn[disabled]{opacity:.5;cursor:default}',
      '.cv-link{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;padding:0 2px}',
      '.cv-link:hover{color:var(--dsw-alias-label-primary)}',
      '.cv-list{border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-1)}',
      '.cv-row{padding:10px 14px;border-top:.5px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:6px}',
      '.cv-row:first-child{border-top:0}',
      '.cv-row-head{display:flex;align-items:center;gap:10px}',
      '.cv-row-title{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.cv-row-sub{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
      '.cv-badges{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
      '.cv-badge{font-size:10.5px;padding:1px 6px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.cv-badge-warn{border-color:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}',
      '.cv-badge-danger{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}',
      '.cv-secret{margin-top:2px;display:flex;gap:8px;align-items:center}',
      '.cv-secret-value{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;padding:5px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;user-select:all}',
      '.cv-history{font-size:11px;color:var(--dsw-alias-label-secondary);display:flex;flex-direction:column;gap:2px;margin-top:2px}',
      '.cv-form{border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--dsw-alias-bg-layer-1)}',
      '.cv-form-title{font-size:13px;font-weight:600}',
      '.cv-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.cv-field{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.cv-label{font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.cv-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px 16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px}',
      '.cv-state-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}',
      '.cv-card{max-width:420px;width:100%;display:flex;flex-direction:column;gap:12px;border:.5px solid var(--dsw-alias-border-l1);border-radius:10px;padding:18px;background:var(--dsw-alias-bg-layer-1);text-align:left}',
      '.cv-error{color:var(--dsw-alias-state-error-primary);font-size:12px}',
      '.cv-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
      '.cv-warn{color:var(--dsw-alias-state-warn-primary)}',
    ].join('\n')

    /** JSON request helper. */
    async function api(path, options = {}) {
      const headers = { accept: 'application/json' }
      if (options.token !== undefined) headers['x-vault-token'] = options.token
      if (options.body !== undefined) headers['content-type'] = 'application/json'
      const response = await fetch(path, {
        method: options.body === undefined ? 'GET' : 'POST',
        headers,
        ...options.body === undefined ? {} : { body: JSON.stringify(options.body) },
      })
      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }
      if (!response.ok) {
        const error = new Error(typeof data.error === 'string' ? data.error : `HTTP ${String(response.status)}`)
        error.status = response.status
        throw error
      }
      return data
    }

    /** Days until one YYYY-MM-DD date (negative when past). */
    function daysLeft(dateText) {
      if (typeof dateText !== 'string') return null
      const end = new Date(`${dateText}T23:59:59`)
      if (Number.isNaN(end.getTime())) return null
      return Math.ceil((end.getTime() - Date.now()) / 86400000)
    }

    /** Short local time. */
    function formatTime(value) {
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
      } catch {
        return ''
      }
    }

    /** Numeric expiry badge for one entry. */
    function ExpiryBadge({ entry, t }) {
      if (entry.expiresAt === null || entry.expiresAt === undefined) return h('span', { className: 'cv-badge' }, t('view.noExpiry'))
      const days = daysLeft(entry.expiresAt)
      if (days === null) return h('span', { className: 'cv-badge' }, entry.expiresAt)
      const label = days < 0 ? t('view.expired', { days: Math.abs(days) }) : t('view.expiresIn', { days })
      const className = days < 0 ? 'cv-badge cv-badge-danger' : days <= 7 ? 'cv-badge cv-badge-warn' : 'cv-badge'
      return h('span', { className }, `${entry.expiresAt} · ${label}`)
    }

    /** Entry row with reveal/copy/edit/history. */
    function EntryRow({ entry, token, t, onSaved }) {
      const [revealed, setRevealed] = React.useState(null)
      const [copied, setCopied] = React.useState(false)
      const [historyOpen, setHistoryOpen] = React.useState(false)
      const [editing, setEditing] = React.useState(false)
      const timer = React.useRef(null)

      const hide = () => {
        setRevealed(null)
        if (timer.current !== null) clearTimeout(timer.current)
      }
      const reveal = async () => {
        if (revealed !== null) {
          hide()
          return
        }
        try {
          const data = await api('/api/credential-vault.reveal', { token, body: { id: entry.id } })
          setRevealed(data.secret)
          timer.current = setTimeout(hide, 30000)
        } catch (error) {
          if (error.status === 401) onSaved(null)
          else alert(error.message)
        }
      }
      const copy = async () => {
        try {
          let secret = revealed
          if (secret === null) {
            const data = await api('/api/credential-vault.reveal', { token, body: { id: entry.id } })
            secret = data.secret
          }
          await navigator.clipboard.writeText(secret)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch (error) {
          if (error.status === 401) onSaved(null)
          else alert(error.message)
        }
      }
      const remove = async () => {
        if (!confirm(t('view.confirmDelete', { title: entry.title }))) return
        try {
          await api('/api/credential-vault.delete', { token, body: { id: entry.id } })
          onSaved('deleted')
        } catch (error) {
          if (error.status === 401) onSaved(null)
          else alert(error.message)
        }
      }

      if (editing) {
        return h(EntryForm, { entry, token, t, onCancel: () => setEditing(false), onSaved: () => { setEditing(false); onSaved('saved') }, onDelete: remove })
      }

      const reminderLabel = t(`view.reminder.${entry.reminder ?? 'none'}`)
      return h('div', { className: 'cv-row', 'data-vault-entry': entry.title },
        h('div', { className: 'cv-row-head' },
          h('span', { className: 'cv-row-title' }, entry.title),
          entry.username === '' ? null : h('span', { className: 'cv-row-sub' }, `@${entry.username}`),
          h('span', { className: 'cv-spacer' }),
          h('span', { className: 'cv-row-sub' }, t('view.by', { by: entry.insertedBy })),
        ),
        h('div', { className: 'cv-row-sub' }, entry.site === '' ? entry.note : `${entry.site}${entry.note === '' ? '' : ` · ${entry.note}`}`),
        h('div', { className: 'cv-badges' },
          h(ExpiryBadge, { entry, t }),
          entry.reminder === 'none' ? null : h('span', { className: 'cv-badge' }, reminderLabel),
          h('span', { className: 'cv-badge' }, t('view.updated', { time: formatTime(entry.updatedAt) }))),
        revealed === null ? null : h('div', { className: 'cv-secret' },
          h('span', { className: 'cv-secret-value' }, revealed),
          h('button', { type: 'button', className: 'cv-link', onClick: hide }, t('view.hide'))),
        h('div', { className: 'cv-actions' },
          h('button', { type: 'button', className: 'cv-btn', onClick: reveal }, revealed === null ? t('view.reveal') : t('view.hide')),
          h('button', { type: 'button', className: 'cv-btn', onClick: copy }, copied ? t('view.copied') : t('view.copy')),
          h('button', { type: 'button', className: 'cv-btn', onClick: () => setEditing(true) }, t('view.edit')),
          h('button', { type: 'button', className: 'cv-btn cv-btn-danger', onClick: remove }, t('view.delete')),
          h('button', { type: 'button', className: 'cv-link', onClick: () => setHistoryOpen(!historyOpen) }, t('view.history'))),
        historyOpen ? h('div', { className: 'cv-history' },
          entry.history.length === 0 ? '—' : entry.history.map((item, index) => h('span', { key: index },
            `${formatTime(item.at)} · ${item.by} · ${item.summary}`))) : null)
    }

    /** Add/edit form. */
    function EntryForm({ entry, token, t, onCancel, onSaved, onDelete }) {
      const editing = entry !== undefined && entry !== null
      const [title, setTitle] = React.useState(editing ? entry.title : '')
      const [username, setUsername] = React.useState(editing ? entry.username : '')
      const [site, setSite] = React.useState(editing ? entry.site : '')
      const [secret, setSecret] = React.useState('')
      const [expiresAt, setExpiresAt] = React.useState(editing && entry.expiresAt !== null ? entry.expiresAt : '')
      const [reminder, setReminder] = React.useState(editing ? entry.reminder : 'none')
      const [note, setNote] = React.useState(editing ? entry.note : '')
      const [error, setError] = React.useState(null)
      const [busy, setBusy] = React.useState(false)

      const save = async () => {
        if (title.trim() === '') return setError(t('view.formTitle'))
        if (!editing && secret === '') return setError(t('view.formSecret'))
        setBusy(true)
        setError(null)
        try {
          await api('/api/credential-vault.save', {
            token,
            body: {
              entry: {
                ...editing ? { id: entry.id } : {},
                title: title.trim(),
                username,
                site,
                secret,
                expiresAt: expiresAt === '' ? null : expiresAt,
                reminder,
                note,
              },
            },
          })
          onSaved()
        } catch (error) {
          if (error.status === 401) onSaved(null)
          else setError(error.message)
        } finally {
          setBusy(false)
        }
      }

      return h('div', { className: 'cv-form' },
        h('div', { className: 'cv-form-title' }, editing ? t('view.editEntry') : t('view.newEntry')),
        h('div', { className: 'cv-grid' },
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.formTitle')),
            h('input', { className: 'cv-input', value: title, onChange: (event) => setTitle(event.target.value) })),
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.formUsername')),
            h('input', { className: 'cv-input', value: username, onChange: (event) => setUsername(event.target.value) }))),
        h('label', { className: 'cv-field' },
          h('span', { className: 'cv-label' }, editing ? t('view.formSecretEdit') : t('view.formSecret')),
          h('input', { className: 'cv-input', type: 'password', value: secret, onChange: (event) => setSecret(event.target.value), autoComplete: 'new-password' })),
        h('label', { className: 'cv-field' },
          h('span', { className: 'cv-label' }, t('view.formSite')),
          h('input', { className: 'cv-input', value: site, onChange: (event) => setSite(event.target.value) })),
        h('div', { className: 'cv-grid' },
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.formExpires')),
            h('input', { className: 'cv-input', type: 'date', value: expiresAt, onChange: (event) => setExpiresAt(event.target.value) })),
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.formReminder')),
            h('select', { className: 'cv-input', value: reminder, onChange: (event) => setReminder(event.target.value) },
              h('option', { value: 'none' }, t('view.reminder.none')),
              h('option', { value: '7d' }, t('view.reminder.7d')),
              h('option', { value: '3d' }, t('view.reminder.3d')),
              h('option', { value: 'on' }, t('view.reminder.on'))))),
        h('label', { className: 'cv-field' },
          h('span', { className: 'cv-label' }, t('view.formNote')),
          h('textarea', { className: 'cv-input', rows: 2, value: note, onChange: (event) => setNote(event.target.value) })),
        error === null ? null : h('div', { className: 'cv-error' }, error),
        h('div', { className: 'cv-actions' },
          h('button', { type: 'button', className: 'cv-btn cv-btn-primary', disabled: busy, onClick: save }, t('view.save')),
          h('button', { type: 'button', className: 'cv-btn', disabled: busy, onClick: onCancel }, t('view.cancel')),
          editing && onDelete !== undefined ? h('button', { type: 'button', className: 'cv-btn cv-btn-danger', onClick: onDelete }, t('view.delete')) : null))
    }

    /** Setup / unlock card. */
    function Gate({ mode, t, onUnlocked }) {
      const [password, setPassword] = React.useState('')
      const [confirmValue, setConfirmValue] = React.useState('')
      const [error, setError] = React.useState(null)
      const [busy, setBusy] = React.useState(false)

      const submit = async () => {
        setError(null)
        if (password.length < 8) return setError(t('view.short'))
        if (mode === 'setup' && password !== confirmValue) return setError(t('view.mismatch'))
        setBusy(true)
        try {
          const path = mode === 'setup' ? '/api/credential-vault.setup' : '/api/credential-vault.unlock'
          const data = await api(path, { body: { password } })
          onUnlocked(data.token)
        } catch (error) {
          setError(error.message)
        } finally {
          setBusy(false)
        }
      }

      return h('div', { className: 'cv-state' },
        h('div', { className: 'cv-state-title' }, mode === 'setup' ? t('view.setupTitle') : t('view.unlockTitle')),
        h('div', { className: 'cv-card' },
          h('div', { className: 'cv-sub' }, mode === 'setup' ? t('view.setupHint') : t('view.unlockHint')),
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.password')),
            h('input', {
              className: 'cv-input',
              type: 'password',
              value: password,
              autoFocus: true,
              onChange: (event) => setPassword(event.target.value),
              onKeyDown: (event) => { if (event.key === 'Enter') submit() },
            })),
          mode === 'setup' ? h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.passwordConfirm')),
            h('input', {
              className: 'cv-input',
              type: 'password',
              value: confirmValue,
              onChange: (event) => setConfirmValue(event.target.value),
              onKeyDown: (event) => { if (event.key === 'Enter') submit() },
            })) : null,
          error === null ? null : h('div', { className: 'cv-error' }, error),
          h('button', { type: 'button', className: 'cv-btn cv-btn-primary', disabled: busy, onClick: submit }, mode === 'setup' ? t('view.setup') : t('view.unlock'))))
    }

    /** The whole view. */
    function VaultView(props) {
      const t = props.t
      const [phase, setPhase] = React.useState('loading')
      const [token, setToken] = React.useState(null)
      const [entries, setEntries] = React.useState([])
      const [search, setSearch] = React.useState('')
      const [adding, setAdding] = React.useState(false)
      const [changing, setChanging] = React.useState(false)
      const [error, setError] = React.useState(null)

      const loadList = React.useCallback(async (activeToken) => {
        try {
          const data = await api('/api/credential-vault.list', { token: activeToken })
          setEntries(Array.isArray(data.entries) ? data.entries : [])
          setPhase('ready')
        } catch (error) {
          if (error.status === 401) {
            setToken(null)
            setPhase('locked')
          } else {
            setError(error.message)
            setPhase('error')
          }
        }
      }, [])

      React.useEffect(() => {
        let cancelled = false
        api('/api/credential-vault.state').then((data) => {
          if (cancelled) return
          setPhase(data.initialized ? 'locked' : 'setup')
        }).catch((error) => {
          if (cancelled) return
          setError(error.message)
          setPhase('error')
        })
        return () => { cancelled = true }
      }, [])

      const unlocked = (newToken) => {
        if (newToken === null) {
          setToken(null)
          setPhase('locked')
          return
        }
        setToken(newToken)
        setPhase('ready')
        loadList(newToken)
      }

      const lock = () => {
        setToken(null)
        setEntries([])
        setPhase('locked')
      }

      const visible = entries.filter((entry) => {
        if (search.trim() === '') return true
        const needle = search.trim().toLowerCase()
        return `${entry.title} ${entry.username} ${entry.site} ${entry.note}`.toLowerCase().includes(needle)
      })

      if (phase === 'loading') {
        return h('div', { className: 'cv-root', 'data-credential-vault': true }, h('style', null, CSS), h('div', { className: 'cv-state' }, t('view.loading')))
      }
      if (phase === 'error') {
        return h('div', { className: 'cv-root', 'data-credential-vault': true }, h('style', null, CSS),
          h('div', { className: 'cv-state' }, h('div', { className: 'cv-error' }, `${t('view.error')}: ${error ?? ''}`),
            h('button', { type: 'button', className: 'cv-btn', onClick: () => location.reload() }, t('view.retry'))))
      }
      if (phase === 'setup' || phase === 'locked') {
        return h('div', { className: 'cv-root', 'data-credential-vault': true }, h('style', null, CSS),
          h('div', { className: 'cv-head' }, h('h2', { className: 'cv-title' }, t('view.title')), h('span', { className: 'cv-spacer' })),
          h(Gate, { mode: phase, t, onUnlocked: unlocked }))
      }

      return h('div', { className: 'cv-root', 'data-credential-vault': true },
        h('style', null, CSS),
        h('div', { className: 'cv-head' },
          h('h2', { className: 'cv-title' }, t('view.title')),
          h('span', { className: 'cv-count' }, t('view.entryCount', { count: entries.length })),
          h('span', { className: 'cv-spacer' }),
          h('button', { type: 'button', className: 'cv-link', onClick: () => setChanging(true) }, t('view.changePassword')),
          h('button', { type: 'button', className: 'cv-btn', onClick: lock }, t('view.lock'))),
        h('div', { className: 'cv-sub' }, t('view.subtitle')),
        changing ? h(ChangePasswordForm, { token, t, onClose: () => setChanging(false) }) : null,
        h('div', { className: 'cv-toolbar' },
          h('input', {
            className: 'cv-input cv-search',
            placeholder: t('view.search'),
            value: search,
            onChange: (event) => setSearch(event.target.value),
          }),
          h('button', { type: 'button', className: 'cv-btn cv-btn-primary', onClick: () => setAdding(true) }, `+ ${t('view.add')}`)),
        adding ? h(EntryForm, {
          token,
          t,
          onCancel: () => setAdding(false),
          onSaved: () => { setAdding(false); loadList(token) },
        }) : null,
        visible.length === 0
          ? h('div', { className: 'cv-state' }, h('div', { className: 'cv-state-title' }, t('view.empty')), h('span', null, t('view.emptyHint')))
          : h('div', { className: 'cv-list' },
            visible.map((entry) => h(EntryRow, {
              key: entry.id,
              entry,
              token,
              t,
              onSaved: (result) => {
                if (result === null) {
                  lock()
                  return
                }
                loadList(token)
              },
            })))
      )
    }

    /** Inline master-password change. */
    function ChangePasswordForm({ token, t, onClose }) {
      const [current, setCurrent] = React.useState('')
      const [next, setNext] = React.useState('')
      const [error, setError] = React.useState(null)
      const submit = async () => {
        if (next.length < 8) return setError(t('view.short'))
        try {
          await api('/api/credential-vault.password', { token, body: { current, next } })
          onClose()
        } catch (error) {
          setError(error.message)
        }
      }
      return h('div', { className: 'cv-form' },
        h('div', { className: 'cv-form-title' }, t('view.changePassword')),
        h('div', { className: 'cv-grid' },
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.currentPassword')),
            h('input', { className: 'cv-input', type: 'password', value: current, onChange: (event) => setCurrent(event.target.value) })),
          h('label', { className: 'cv-field' },
            h('span', { className: 'cv-label' }, t('view.newPassword')),
            h('input', { className: 'cv-input', type: 'password', value: next, onChange: (event) => setNext(event.target.value) }))),
        error === null ? null : h('div', { className: 'cv-error' }, error),
        h('div', { className: 'cv-actions' },
          h('button', { type: 'button', className: 'cv-btn cv-btn-primary', onClick: submit }, t('view.save')),
          h('button', { type: 'button', className: 'cv-btn', onClick: onClose }, t('view.cancel'))))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'credential-vault: dictionaries')
        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'credential-vault',
          order: 26,
          locale: NS,
          label: () => ctx.locale.bind(NS)('view.label'),
        }, VaultView))
      },
    }
  },
})
