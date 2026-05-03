import { app } from "../../worker/src/api/routes";
import type { Env } from "../../worker/src/env";

export const onRequest: PagesFunction<Env> = (context) => {
  return app.fetch(context.request, context.env, context);
};
