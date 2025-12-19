import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("VERIFICATION_VIEW")) throw new Error("Forbidden");
    return verificationService.findAll(query,auth);
  }, {
    query: VerificationContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("VERIFICATION_CREATE")) throw new Error("Forbidden");
    return verificationService.create(body,auth);
  }, {
    body: VerificationContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("VERIFICATION_EDIT")) throw new Error("Forbidden");
    return verificationService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: VerificationContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("VERIFICATION_DELETE")) throw new Error("Forbidden");
    return verificationService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
