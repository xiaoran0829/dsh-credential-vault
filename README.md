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

## 接入方式（引导接入）

- 形态：DSH Web Cordis 插件（`dsh.bundle.patch` + `dsh.client`），在 DSH Connection 上注册需登录态的 Fetch 路由。
- `package.json#dshWorkshop` 声明为 `harness-cordis` + `third-party` adapter 的 guided 接入；当前没有事务安装、没有 Registry 安装权限，也没有可执行安装步骤。
- 安装或升级插件后需重启 DSH Web 的 profile 才生效。
- 未在 Workshop 官方基线 `@deepseek-ai/dsh@0.1.0-rc.6` 上验证；`evidence` 的安装、失败隔离、热重载、卸载四项均为 `null`（尚无证据）。

## 权限与外部副作用

| 能力 | 事实 |
|---|---|
| 文件写入 | 只写 `~/.dsh/vault`：`key.bin`（32 字节，0600）、`store.json`（0600，原子写）、目录 0700；可用 `DSH_VAULT_DIR` 改目录 |
| 加密 | `node:crypto`：secret 用 AES-256-GCM 以机器密钥加密；主密码用 PBKDF2-SHA256（210000 次）派生 |
| HTTP | 在 DSH Connection fence 上注册 `/api/credential-vault.*`，继承 GUI 登录态与 Host/Origin 校验 |
| 网络外发 | 无。插件不发第三方请求 |
| 进程 | 不起子进程、不跑后台任务、无 install script |
| 不可 generation 回滚 | 已写入的条目、主密码与密钥不受 Profile 代际恢复影响；主密码忘记无法找回，只能删 `store.json` 重来 |

## 兼容与测试

- 作者本机：DSH Web `0.2.1-rc.3`（当前安装版本）。
- 已有检查：`node --check index.js vault.js vaultctl.mjs client.js` 通过；无单元/集成测试、无官方基线生命周期测试、无失败注入或热重载证据。
- 兼容声明以作者本机使用为准，未做官方基线验证。

## 已知限制

- 主密码没有找回通道；页面每次加载重新上锁，解锁 token 只存内存 15 分钟。
- 机器密钥可被运行 DSH 的账户读取，这是 Agent 无限制查阅的代价，不是插件缺陷。
- 解锁失败限流为 5 分钟内 12 次。
- 插件没有 dispose 证据，`dshWorkshop.lifecycle.dispose` 如实写 `unknown`。

