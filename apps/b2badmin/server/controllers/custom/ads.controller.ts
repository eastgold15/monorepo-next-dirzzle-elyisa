import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "../../modules/index";
import { authGuardMid } from "../../middleware/auth";

/**
 * 自定义 Ads 控制器
 * 这里的逻辑会完全替换生成的版本
 */
export const adsController = new Elysia({ prefix: "/ads" })
    .use(authGuardMid)
    // 1. 完全自定义的查询逻辑
    .get("/special", async ({ body }) => {
        return { message: "这是一个完全手写的特殊接口" };
    }, {
        body: AdsContract.Create
    })

    // 2. 在原有基础上修改的接口
    .post("/", async ({ body, auth }) => {
        console.log(`正在创建广告`);
        return adsService.create(body, auth);
    }, {
        body: AdsContract.Create
    })
