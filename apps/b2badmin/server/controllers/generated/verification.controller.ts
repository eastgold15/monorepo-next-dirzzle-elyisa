import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("VERIFICATION_VIEW")) throw new Error("Forbidden");
    return verificationService.findAll(query);
  }, {
    query: VerificationContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("VERIFICATION_CREATE")) throw new Error("Forbidden");
    return verificationService.create(body);
  }, {
    body: VerificationContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("VERIFICATION_EDIT")) throw new Error("Forbidden");
    return verificationService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: VerificationContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("VERIFICATION_DELETE")) throw new Error("Forbidden");
    return verificationService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
