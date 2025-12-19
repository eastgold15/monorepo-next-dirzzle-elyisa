import { Elysia, t } from "elysia";
import { VerificationContract } from "@repo/contract";
import { verificationService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const verificationController = new Elysia({ prefix: "/verification" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return verificationService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: VerificationContract.ListQuery,
    detail: {
      summary: "获取Verification列表",
      description: "获取所有Verification的列表信息",
      tags: ["Verification"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return verificationService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: VerificationContract.Create,
    detail: {
      summary: "创建Verification",
      description: "创建新的Verification",
      tags: ["Verification"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return verificationService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: VerificationContract.Patch,
    detail: {
      summary: "更新Verification",
      description: "根据ID更新Verification信息",
      tags: ["Verification"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return verificationService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Verification",
      description: "根据ID删除Verification",
      tags: ["Verification"]
    }
  });
