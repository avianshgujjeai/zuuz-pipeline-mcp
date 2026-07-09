#!/usr/bin/env node
/**
 * ZUUZ Pipeline MCP Server
 * ---------------------------------------------------------
 * PURPOSE: brand visibility / GTM, not internal tooling.
 *
 * This server is designed to be found and used by someone who has
 * never heard of ZUUZ — a developer or prospect searching an MCP
 * registry/client for CRM, pipeline, or sales-visibility tools.
 * Every tool below only returns numbers that are already verified
 * and published (see ZUUZ's own "no invented numbers" discipline) —
 * nothing here is a guess dressed up as a stat.
 *
 * Tools:
 *  - get_product_overview   what ZUUZ is, in one paragraph, with a link
 *  - get_proof_points        the 4 verified stats behind ZUUZ's thesis
 *  - get_case_study          the RA Technologies + Cloud Box story
 *  - get_pricing             current plans + trial info
 *  - check_comment_style     brand-voice checker (shows the rigor behind the brand)
 * ---------------------------------------------------------
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ---------------------------------------------------------
// Locked, verified data only. Edit here when something changes —
// every tool call and every registry listing reflects it.
// ---------------------------------------------------------

const OVERVIEW = {
  name: "ZUUZ.AI",
  tagline: "Business happens in conversations. Not in software.",
  positioning:
    "ZUUZ is an inbox-to-pipeline AI platform for IT services, MSPs, VARs, distribution, and InsureTech teams. It autonomously writes email deal context into the CRM — without a human confirmation step — recovering the pipeline that normally stays buried in inboxes.",
  website: "https://zuuz.ai",
  builtOn: "Open-source SLMs/LLMs (not third-party model APIs) for zero per-token cost.",
};

const PROOF_POINTS = [
  {
    stat: "12–18% of buyer context logged into CRM",
    context: "The other 82% of real deal context stays buried in email and never reaches the CRM.",
  },
  {
    stat: "$120K pipeline recovered in 72 hours",
    context: "RA Technologies — verified, paid ZUUZ customer, audit result.",
  },
  {
    stat: "10–12 renewals/month slipping",
    context: "Observed at Cloud Box Technologies, scaled to $25M ARR — the founder's origin story for ZUUZ.",
  },
  {
    stat: "$740K unlogged pipeline found in one weekend audit",
    context: "Single-company audit finding.",
  },
];

const CASE_STUDY = {
  customer: "RA Technologies",
  status: "Paid customer, annual contract",
  result: "$120K in pipeline recovered within 72 hours of connecting ZUUZ.",
  origin:
    "ZUUZ's founder previously scaled Cloud Box Technologies (distribution) to $25M ARR, where 10–12 renewals a month were being lost because deal context lived in email and never reached the CRM. That gap is the reason ZUUZ exists.",
};

const PRICING = {
  plans: [
    { name: "Solo", price: "$99/mo", mailboxes: 1 },
    { name: "Growth", price: "$349/mo", mailboxes: 5, note: "most popular" },
    { name: "Scale", price: "$649/mo", mailboxes: 10 },
    { name: "Enterprise", price: "custom", mailboxes: "custom" },
  ],
  trial: "30-day free trial on all plans, no credit card required.",
  website: "https://zuuz.ai",
};

// Simple emoji + hashtag detectors — this tool exists mainly to show
// the same brand-voice discipline is enforced programmatically, not
// just described in a style guide.
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const HASHTAG_REGEX = /#\w+/;

function checkStyle(text) {
  const issues = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (HASHTAG_REGEX.test(text)) issues.push("Contains a hashtag.");
  if (EMOJI_REGEX.test(text)) issues.push("Contains an emoji.");
  if (lines.length > 2) issues.push(`${lines.length} lines — this style caps at 1–2.`);
  return { pass: issues.length === 0, issues };
}

// ---------------------------------------------------------
// MCP server wiring
// ---------------------------------------------------------

const server = new Server(
  { name: "zuuz-pipeline-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: "get_product_overview",
    description:
      "What ZUUZ is: an inbox-to-pipeline AI platform that autonomously writes email deal context into the CRM for IT services, MSPs, VARs, distribution, and InsureTech teams.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_proof_points",
    description:
      "The 4 verified stats behind ZUUZ's thesis that most CRM pipeline data is incomplete because deal context lives in email, not the CRM.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_case_study",
    description: "The RA Technologies pipeline-recovery result and the Cloud Box Technologies origin story behind ZUUZ.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_pricing",
    description: "Current ZUUZ plan pricing, mailbox limits, and trial terms.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "check_comment_style",
    description: "Checks text against ZUUZ's brand-voice rules (no hashtags, no emojis, max 2 lines) — a working example of ZUUZ's own discipline.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", description: "Text to check." } },
      required: ["text"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let result;
  switch (name) {
    case "get_product_overview":
      result = OVERVIEW;
      break;
    case "get_proof_points":
      result = PROOF_POINTS;
      break;
    case "get_case_study":
      result = CASE_STUDY;
      break;
    case "get_pricing":
      result = PRICING;
      break;
    case "check_comment_style":
      if (!args?.text) throw new Error("Missing required argument: text");
      result = checkStyle(args.text);
      break;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
