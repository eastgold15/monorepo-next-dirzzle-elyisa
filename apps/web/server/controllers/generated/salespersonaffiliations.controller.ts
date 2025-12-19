import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return salespersonAffiliationsService.findAll(query, { db, user: null });
  }, {
    query: SalespersonAffiliationsContract.ListQuery,
    detail: {
      summary: "获取SalespersonAffiliations列表",
      description: "获取所有SalespersonAffiliations的列表信息",
      tags: ["SalespersonAffiliations"]
    }
  })
  .post("/", ({ body, db }) => {
    return salespersonAffiliationsService.create(body, { db, user: null });
  }, {
    body: SalespersonAffiliationsContract.Create,
    detail: {
      summary: "创建SalespersonAffiliations",
      description: "创建新的SalespersonAffiliations",
      tags: ["SalespersonAffiliations"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return salespersonAffiliationsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonAffiliationsContract.Patch,
    detail: {
      summary: "更新SalespersonAffiliations",
      description: "根据ID更新SalespersonAffiliations信息",
      tags: ["SalespersonAffiliations"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return salespersonAffiliationsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SalespersonAffiliations",
      description: "根据ID删除SalespersonAffiliations",
      tags: ["SalespersonAffiliations"]
    }
  });
