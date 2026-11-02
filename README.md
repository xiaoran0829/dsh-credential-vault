# dsh-credential-vault

DSH Web 插件：本地凭证库，保存密码与 API Token。

## 中文说明

- **加密存储**：条目用 AES-256-GCM 加密，机器密钥在 `~/.dsh/vault/key.bin`（权限 600）。
- **人类查看**：会话顶栏「凭证库」tab，首次使用强制设置主密码（至少 8 位）；每次打开页面都锁定，输主密码解锁 15 分钟（仅内存 token）。
- **Agent 查阅**：`vaultctl.mjs` 通过机器密钥直接读，不受主密码限制。
- **字段**：名称、用户名、密码/Token、验证地（网址/程序）、初次录入方、修改更新记录、有效截止期、截止提醒（单选：不提醒 / 提前 7 天 / 提前 3 天 / 到期当天）。
- **手动录入**：新增/编辑/删除都支持；修改会追加到记录里。

### Agent CLI

```bash
node <install-dir>/vaultctl.mjs list
node <install-dir>/vaultctl.mjs show "<名称>"
node <install-dir>/vaultctl.mjs add --title "..." --secret "..." --site "..." --expires 2026-12-31 --reminder 7d
```

### 注意

- 主密码没有找回：忘了只能删 `~/.dsh/vault/store.json` 重来（条目全丢）。
- 机器密钥可被 DSH 运行账户读取，这是「Agent 无限查阅」的代价。

---

DSH Web plugin: a local credential vault for passwords and API tokens.

- Encrypted at rest: entries are AES-256-GCM sealed with a machine key (`~/.dsh/vault/key.bin`, mode 600).
- Human view: the browser tab **凭证库 / Vault** forces a master password on first use and locks again on every page load; only a correct password issues a 15-minute in-memory unlock token.
- Agent view: `vaultctl.mjs` reads the same store through the machine key, with no master-password gate.
- Fields: title, username, secret, where it is used (URL/program), recorded-by, update history, expiry date, and a single-choice expiry reminder.
- Routes live on the DSH Connection fence, so the public proxy and login keep working unchanged.

## Agent CLI

```bash
node <install-dir>/vaultctl.mjs list
node <install-dir>/vaultctl.mjs show "<title>"
node <install-dir>/vaultctl.mjs add --title "..." --secret "..." --site "..." --expires 2026-12-31 --reminder 7d
```

## Notes

- The master password cannot be reset from the UI; deleting `~/.dsh/vault/store.json` starts over (and loses entries).
- The browser unlock token lives in page memory for 15 minutes.
- The machine key is readable by the account running DSH, which is what makes agent access unlimited; this is a deliberate trade-off.
