import {Router} from "express"
import { authregister, loginauth, logincitizen } from "../controllers/userregister.controllers.js";
import { citizenregister } from "../controllers/userregister.controllers.js";

const router = Router();

router.route("/register/authority").post(authregister)
router.route("/register/citizen").post(citizenregister)
router.route("/login/citizen").post(logincitizen)
router.route("/login/authority").post(loginauth)

export {router}
