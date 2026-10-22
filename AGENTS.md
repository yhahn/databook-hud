# Use this databook with any agent

This repo is a databook: its markdown, read as tables. To let your agent read it, paste this into its setup, or add the server to its MCP config:

    npx -y databook-mcp https://github.com/yhahn/databook-hud

Your agent starts with `about`, then `query`. Every table names the file and lines it came from, so it can check its answers.

If you have a checkout of this repo and `proper` installed, use `proper query "<sql>"` instead. It reads the markdown as it is now and can write changes too.
