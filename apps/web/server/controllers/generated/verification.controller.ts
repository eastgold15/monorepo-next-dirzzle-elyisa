import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return verificationService.findAll(query, { db, user: null });
  }, {
    query: VerificationContract.ListQuery,
    detail: {
      summary: "获取Verification列表",
      description: "获取所有Verification的列表信息",
      tags: ["Verification"]
    }
  })
  .post("/", ({ body, db }) => {
    return verificationService.create(body, { db, user: null });
  }, {
    body: VerificationContract.Create,
    detail: {
      summary: "创建Verification",
      description: "创建新的Verification",
      tags: ["Verification"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return verificationService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: VerificationContract.Patch,
    detail: {
      summary: "更新Verification",
      description: "根据ID更新Verification信息",
      tags: ["Verification"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return verificationService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Verification",
      description: "根据ID删除Verification",
      tags: ["Verification"]
    }
  });
