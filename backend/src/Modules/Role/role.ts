import { Router } from "express";
import { getRoles, createRole, deleteRole } from "./roleCn.js";
import isLogin from "../../MiddleWare/isLogin.js";

const roleRouter = Router();

roleRouter.route("/")
    .get(isLogin, getRoles)
    .post(isLogin, createRole);

roleRouter.route("/:id")
    .delete(isLogin, deleteRole);

export default roleRouter;
