# Research completion notifications

Sunny requested Telegram updates when repeat collections succeed. A separate observer on the Hermes VPS checks W2, W3 and W4; it cannot submit searches, resume collection, review citations or publish findings.

## When a message is sent

The existing offline inspector must report a complete, certain 100-capture run. The observer also verifies the byte size and SHA-256 of all six saved evidence files for each capture, checks that paths stay inside the registered run, and rejects state that changes during verification. Only then can it send a completion message.

The message reports that the captures and files are saved and that manual citation review and analysis remain pending. It does not report a retention finding, publication approval or provider balance. W1 is excluded from this notification schedule.

## Telegram route

The observer reuses the existing Hermes cron notification route: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_HOME_CHANNEL` in the root-owned, mode-`0600` `/root/.hermes/cron-env`. It reads those two literal assignments without executing the file. Credentials and the private chat identifier are excluded from Git, logs and notification messages.

This is the same bot and private home chat used by the existing Hermes cron notifier. The interactive gateway configuration is unchanged. The observer sends plain text through the [Telegram Bot API](https://core.telegram.org/bots/api#sendmessage) and records success only after a matching message acknowledgement.

## Schedule and duplicate protection

`sunnypatel-aio-citation-telegram-notify.timer` checks every five minutes from 10:00 through 23:55 UTC on 20 September, 27 September and 4 October 2026. This covers the registered collection and resume windows. Persistent timer catch-up can check completed waves after a reboot. Delivery depends on the server, network and Telegram being available.

Notification records live separately under `tmp/ctr-aio/citation-study/notifications`. A durable attempt is recorded before sending. A successful acknowledgement suppresses subsequent sends for that wave; an interrupted or uncertain attempt is held for manual inspection of Telegram and the saved record. Do not delete an attempt record just to retry. Telegram delivery and local file persistence cannot form one atomic transaction, so this is duplicate suppression rather than an exactly-once guarantee.

The observer uses its own service and notification files. It leaves the six collection/resume timers, their services, collection locks, execution registry and seven frozen research files unchanged.

## Operation

From `/root/.hermes/research/sunnypatel-aio-citation-v1`:

```bash
systemctl status sunnypatel-aio-citation-telegram-notify.timer
journalctl -u sunnypatel-aio-citation-telegram-notify.service
node scripts/research/aio-citation-telegram-notify.mjs --check
```

`--test-connection` sends a clearly labelled setup test through the same route, with its own duplicate-suppression record. It does not simulate a completed wave or request any research data. Use the saved setup receipt to verify the test rather than repeatedly sending it.

Read the [collection runbook](ai-overview-citation-runbook.md) and [analysis/publication workflow](ai-overview-citation-publication-workflow.md) for the separate research steps.
