import { Router } from "express";
import { getPermissions } from "./permissionCn.js";
import isLogin from "../../MiddleWare/isLogin.js";

const permissionRouter = Router();

permissionRouter.route("/").get(isLogin, getPermissions);

export default permissionRouter;
