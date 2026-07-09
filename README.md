# ZUUZ Pipeline MCP Server — a GTM/AEO asset, not an internal tool

This is deliberately different from a typical "internal utility" MCP server.
The only reason this exists is brand visibility, so every tool returns
something a stranger who's never heard of ZUUZ would find useful or
interesting on its own: `get_product_overview`, `get_proof_points`,
`get_case_study`, `get_pricing`, `check_comment_style`. Nothing here needs a
ZUUZ account or login — it's a small, standalone demonstration of what ZUUZ
believes, backed only by numbers that are already verified elsewhere (no
number here is invented for this tool — same discipline as the pitch deck).

## Where "MCP visibility" actually comes from — look at the whole funnel, not just one listing

Getting listed in one place is not the same as being seen. Here's every
surface this actually touches, in order of how much real traffic each one
carries today:

1. **The GitHub repo itself** — public, indexable by Google and by any AI
   tool that browses the web (ChatGPT, Perplexity, Claude with search). A
   repo titled `zuuz-pipeline-mcp` with "CRM," "pipeline," and "MSP" in its
   description is itself a small SEO/AEO asset, independent of whether
   anyone ever runs the server.
2. **The npm package page** (npmjs.com/package/zuuz-pipeline-mcp) — same
   deal: public, indexed, keyword-searchable.
3. **The Official MCP Registry** (registry.modelcontextprotocol.io) — a raw,
   developer-facing index. Today this has real but modest traffic (a few
   thousand servers, mostly discovered by people building MCP clients or
   agents, not end customers Googling things). Its main value right now is
   being early in a category before it's crowded.
4. **Community aggregators — mcp.so, Smithery, PulseMCP, Glama** — this is
   the layer with actual human eyeballs and Google-indexed pages per server.
   I checked Glama directly just now: it's auto-crawling ~53,000 MCP servers
   from GitHub/npm, not requiring a manual submission for basic listing —
   publish cleanly (steps below) and it's likely to get auto-discovered
   within days. There's a separate "claim this server" flow (sign in via
   GitHub/Google) to control how the listing looks once it appears — worth
   doing once it's live, not before. I'd suggest checking mcp.so, Smithery,
   and PulseMCP's own submission pages the same way once this is live, since
   each may differ and this space changes fast.
5. **Anthropic's own connector directory** (inside Claude.ai / Claude Code) —
   the highest-value placement, because it puts ZUUZ in front of users at the
   moment of intent, inside the product itself. This is a partnership/
   certification process with Anthropic, not self-serve — a later-stage goal,
   not step one.

**Honest expectation to set for yourself:** layers 1–4 are a legitimate
"be early" bet with real but currently modest traffic — worth doing because
it's cheap and compounds, not because it's about to replace LinkedIn,
content, or outbound as a lead source. Don't staff a Q3 plan around it.

## Does a separate GitHub repo hurt brand visibility? No — here's why

None of the four layers above care where the repo lives relative to
ZUUZ-Revamp. The registry and every aggregator show *metadata* — name,
description, links — not "is this folder inside the same repo as the
marketing site." A second repo under the same GitHub account
(`avianshgujjeai`, same author as ZUUZ-Revamp) is still visibly, obviously
connected to you and to ZUUZ. Merging it into ZUUZ-Revamp would add real risk
(shared deploy pipeline, shared history) for zero visibility upside. Keep it
separate — that's not a compromise, it's the correct call either way.

## What actually moves the needle for your stated goal: the namespace

Given the goal is brand visibility specifically, one decision matters more
than repo location: **the namespace your server publishes under is what
shows up in every single search result, on every layer above.**

- `io.github.avianshgujjeai/zuuz-pipeline-mcp` → reads as some person's repo.
- `ai.zuuz/pipeline-mcp` → reads as ZUUZ, everywhere, every time.

`package.json` and `server.json` in this project are already set to the
second option. It costs one static file on zuuz.ai and nothing else — see
below.

## Deployment — browser only, separate repo, one small addition to zuuz.ai

**1. New GitHub repo** (e.g. `zuuz-pipeline-mcp`) under the same account as
ZUUZ-Revamp — separate repo, same author, so it still reads as yours.

**2. Upload the files** — "Add file → Upload files" for everything except
the workflow; for `.github/workflows/publish-mcp.yml`, use "Add file →
Create new file" and type the full path into the name box so GitHub creates
the folder.

**3. Prove you own zuuz.ai** (the only touch to the live site — additive,
isolated, no app logic involved):
```bash
openssl genpkey -algorithm Ed25519 -out key.pem
PUBLIC_KEY="$(openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64)"
echo "${PUBLIC_KEY}"
```
This needs to run somewhere with `openssl` — GitHub Codespaces (browser-based
terminal, no local machine) works fine, or ask whoever last touched
ZUUZ-Revamp's repo to run these two lines once. The output is a public
key — not a secret — safe to hand off. Add a DNS TXT record at `zuuz.ai` (via
your DNS provider's dashboard, browser only):
```
zuuz.ai. IN TXT "v=MCPv1; k=ed25519; p=<PUBLIC_KEY>"
```
Keep the matching private key — you'll need it for step 5.

**4. Get an npm Automation token** at npmjs.com (Profile → Access Tokens →
Generate → type "Automation"), and add it as a repo secret: Settings →
Secrets and variables → Actions → New secret → `NPM_TOKEN`.

**5. Add the domain private key as a second secret**: same Settings page →
New secret → `MCP_PRIVATE_KEY` → paste the private key from step 3.

**6. Trigger it**: Releases → Draft a new release → tag `v1.0.0` → Publish.
The workflow publishes to npm, then authenticates to the MCP Registry as
zuuz.ai, then publishes `server.json` under `ai.zuuz/pipeline-mcp`.

**7. Verify:**
```
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=ai.zuuz"
```

**If you'd rather not touch DNS/zuuz.ai at all right now:** swap `mcpName`
in `package.json` and `name` in `server.json` to
`io.github.avianshgujjeai/zuuz-pipeline-mcp`, drop the DNS step, and change
the workflow's auth step to `./mcp-publisher login github-oidc` (needs
`permissions: id-token: write` added to the job, no secret required for that
part). Ships today, less branded namespace, zero touch to zuuz.ai — a fine
place to start and upgrade the namespace later without republishing from
scratch.

## Testing locally (optional — not required to deploy)

```bash
npm install
node test-client.mjs
```
