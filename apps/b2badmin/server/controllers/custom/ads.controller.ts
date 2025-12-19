import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "../../modules/index";
import { authGuard } from "../../middleware/auth";

/**
 * 自定义 Ads 控制器
 * 这里的逻辑会完全替换生成的版本
 */
export const adsController = new Elysia({ prefix: "/ads" })
    .use(authGuard)
    // 1. 完全自定义的查询逻辑
    .get("/special", async () => {
        return { message: "这是一个完全手写的特殊接口" };
    })
    // 2. 在原有基础上修改的接口
    .post("/", async ({ body, siteId }) => {
        console.log(`正在为站点 ${siteId} 创建广告`);
        return adsService.create(body);
    }, {
        body: AdsContract.Create
    })
    // 3. 增加文件上传
    .post("/upload", async ({ body }) => {
        // 处理上传逻辑...
    }, {
        type: 'multipart/form-data',
        body: t.Object({ file: t.File() })
    });