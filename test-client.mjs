import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({ command: "node", args: ["index.js"] });
const client = new Client({ name: "smoke-test", version: "1.0.0" });
await client.connect(transport);

const tools = await client.listTools();
console.log("TOOLS:", tools.tools.map((t) => t.name));

for (const name of ["get_product_overview", "get_proof_points", "get_case_study", "get_pricing"]) {
  const r = await client.callTool({ name, arguments: {} });
  console.log(`\n--- ${name} ---`);
  console.log(r.content[0].text);
}

const style = await client.callTool({
  name: "check_comment_style",
  arguments: { text: "82% of context never reaches the CRM. #sales 🚀" },
});
console.log("\n--- check_comment_style ---");
console.log(style.content[0].text);

await client.close();
process.exit(0);
