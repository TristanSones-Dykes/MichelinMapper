import { app } from "./api/routes";
import { runCrawler } from "./crawler";
import type { Env } from "./env";

export default {
  fetch: app.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(runCrawler(env));
  }
};
