import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return sitesService.findAll(query, { db, user: null });
  }, {
    query: SitesContract.ListQuery,
    detail: {
      summary: "获取Sites列表",
      description: "获取所有Sites的列表信息",
      tags: ["Sites"]
    }
  })
  .post("/", ({ body, db }) => {
    return sitesService.create(body, { db, user: null });
  }, {
    body: SitesContract.Create,
    detail: {
      summary: "创建Sites",
      description: "创建新的Sites",
      tags: ["Sites"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return sitesService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SitesContract.Patch,
    detail: {
      summary: "更新Sites",
      description: "根据ID更新Sites信息",
      tags: ["Sites"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return sitesService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Sites",
      description: "根据ID删除Sites",
      tags: ["Sites"]
    }
  });
