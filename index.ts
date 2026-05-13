import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("dalai", {
    description:
      "Reincarnate: ask the agent to summarise its state, then continue in a fresh session",
    handler: async (_args, ctx) => {
      // Wait for any in-flight agent work to finish
      await ctx.waitForIdle();

      const sessionName = pi.getSessionName();

      // Ask the current agent to produce a continuation prompt
      const summariseRequest = `I need you to produce a "reincarnation prompt" — a self-contained message that will be sent to a brand new agent session so it can continue your work.

Include everything the new agent needs:
- The overarching goal/task
- Key decisions made and why
- Current progress (what's done, what's in-flight)
- What remains to be done (next steps)
- Important file paths, branch names, architectural context
- Any constraints, preferences, or gotchas discovered

Format it as a direct instruction to the new agent — write it in second person ("You are continuing work on..."). Be thorough but concise. Do NOT include pleasantries or meta-commentary — just the handoff prompt itself, wrapped in <reincarnation> tags.`;

      // Send the summarise request and wait for the response
      pi.sendUserMessage(summariseRequest, { deliverAs: "followUp" });
      await ctx.waitForIdle();

      // Extract the reincarnation prompt from the last assistant message
      const branch = ctx.sessionManager.getBranch();
      let reincarnationPrompt = "";

      // Walk backwards to find the last assistant message
      for (let i = branch.length - 1; i >= 0; i--) {
        const entry = branch[i];
        if (entry.type === "message" && entry.message.role === "assistant") {
          const text = Array.isArray(entry.message.content)
            ? entry.message.content
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.text)
                .join("\n")
            : String(entry.message.content ?? "");

          // Try to extract content within <reincarnation> tags
          const match = text.match(/<reincarnation>([\s\S]*?)<\/reincarnation>/);
          reincarnationPrompt = match ? match[1].trim() : text.trim();
          break;
        }
      }

      if (!reincarnationPrompt) {
        ctx.ui.notify("❌ Failed to get reincarnation prompt from agent", "error");
        return;
      }

      ctx.ui.notify("🙏 Reincarnating into a new session...", "info");

      // Create a new session and feed in the continuation prompt
      const preamble = sessionName ? `[Continuing session: "${sessionName}"]\n\n` : "";

      await ctx.newSession({
        withSession: async (newCtx) => {
          await newCtx.sendUserMessage(preamble + reincarnationPrompt);
        },
      });
    },
  });
}
