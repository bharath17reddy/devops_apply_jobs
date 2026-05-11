# Mode: pipeline — URL Inbox (Second Brain)

Processes URLs of accumulated job offers in `data/pipeline.md`. The user adds URLs as needed and then runs `/career-ops pipeline` to process them all.

## Workflow

1. **Read** `data/pipeline.md` → find items `- [ ]` in the "Pending" section
2. **For each pending URL**:
   a. Calculate next `REPORT_NUM` sequential (read `reports/`, take the highest number + 1)
   b. **Extract JD** using Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   c. If URL not accessible → mark as `- [!]` with note and continue
   d. **Execute full auto-pipeline**: Evaluation A-F → Report .md → PDF (if score >= 3.0) → Tracker
   e. **Move from "Pending" to "Processed"**: `- [x] #NNN | URL | Company | Role | Score/5 | PDF ✅/❌`
3. **If 3+ pending URLs**, launch agents in parallel (Agent tool with `run_in_background`) for speed.
4. **After processing all URLs**, run `node auto-apply.mjs --mark` to automatically mark jobs with score >= 3.9 as Applied.
5. **At the end**, show summary table:

```
| # | Company | Role | Score | PDF | Recommended Action |
```

## Format of pipeline.md

```markdown
## Pending
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: login required

## Processed
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

## Intelligent JD Detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs.
2. **WebFetch (fallback):** For static pages when Playwright unavailable.
3. **WebSearch (last resort):** Search secondary portals that index the JD.

**Special cases:**
- **LinkedIn**: May require login → mark `[!]` and ask user to paste text
- **PDF**: If URL points to PDF, read directly with Read tool
- **`local:` prefix**: Read local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`

## Automatic Numbering

1. List all files in `reports/`
2. Extract prefix number (e.g., `142-medispend...` → 142)
3. New number = max found + 1

## Source Synchronization

Before processing any URL, verify sync:
```bash
node cv-sync-check.mjs
```
If desynchronization, warn user before continuing.
