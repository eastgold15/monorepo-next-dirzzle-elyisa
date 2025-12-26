import { InquiryContract } from "@repo/contract";
import Elysia from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { inquiryService } from "~/modules";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(dbPlugin)
  .use(siteMiddleware)

  .post(
    "/",
    async ({ db, siteId, body }) =>
      await inquiryService.submit(body, { db, siteId }),
    {
      body: InquiryContract.Create,
      detail: {
        tags: ["Inquiry"],
        summary: "提交询价请求",
        description: "接收客户询价信息，生成报价单并发送邮件通知给业务员",
      },
    }
  );
