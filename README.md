# /dalai — Agent Reincarnation for Pi

A [pi](https://github.com/mariozechner/pi-coding-agent) extension that lets you transfer your agent's "consciousness" to a fresh session.

When you invoke `/dalai`, the current agent summarises its goals, progress, decisions, and remaining work into a concise handoff prompt. A new session is started and the summary is fed in — like the Dalai Lama's consciousness passing to a new body. 🙏

This is useful when your session gets long/expensive and you want a clean context window without losing track of what you were doing.

## Install

Add to your `~/.pi/agent/settings.json`:

```json
{
  "extensions": [
    "git:github.com/SecureCodeWarrior/pi-extensions-dalai-lama"
  ]
}
```

Then restart pi or run `/reload`.

## Usage

```
/dalai
```

That's it. The agent will:
1. Summarise its current state (goals, progress, next steps, key context)
2. Start a fresh session
3. Feed the summary into the new session so it can continue the work
