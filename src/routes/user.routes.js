import {Router} from "express"
import { authregister, authreport, geminiapi, loginauth, logincitizen, sendemail, verifyotp } from "../controllers/userregister.controllers.js";
import { citizenregister } from "../controllers/userregister.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register/authority").post(authregister)
router.route("/register/citizen").post(citizenregister)
router.route("/login/citizen").post(logincitizen)
router.route("/login/authority").post(loginauth)
router.route("/sendmail").post(sendemail)
router.route("/authreport").post(authreport)
router.route("/verifyotp").post(verifyotp)
router.route("/gemini/api").post(upload.fields([
    {
        name:"reportImage",
        maxCount:1
    }
]),geminiapi)

export {router}
