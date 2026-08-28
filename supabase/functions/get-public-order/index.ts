import {
  asHttpResponse,
  assertPost,
  handleOptions,
  jsonResponse,
} from "../_shared/http.ts";
import { activeBenefits, getAuthorizedOrder, publicOrderSnapshot } from "../_shared/orders.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  try {
    assertPost(req);
    const body = await req.json();
    const order = await getAuthorizedOrder(req, body);

    return jsonResponse({
      ok: true,
      order: publicOrderSnapshot(order, await activeBenefits()),
    });
  } catch (error) {
    return asHttpResponse(error);
  }
});
