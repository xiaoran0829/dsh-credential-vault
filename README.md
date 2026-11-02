# dsh-credential-vault

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
