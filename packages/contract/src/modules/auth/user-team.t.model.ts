import { t } from "elysia";

export const UserTeamInfo = t.Object({
  teamName: t.String(),
  teamType: t.Union([
    t.Literal("exporter_admin"),
    t.Literal("factory_admin"),
    t.Literal("salesperson"),
    t.Literal("unknown"),
  ]),
  description: t.String(),
  memberCount: t.Number(),
  factoryName: t.Optional(t.Union([t.String(), t.Null()])),
  factoryId: t.Optional(t.Union([t.String(), t.Null()])),
  factoryCount: t.Optional(t.Number()),
});

export const UserTeamTModel = {
  UserTeamInfo,
  UserTeamInfoResponse: t.Object({
    data: UserTeamInfo,
    success: t.Boolean(),
    message: t.String(),
  }),
};
