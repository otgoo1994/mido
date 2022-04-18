const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const controller = require('../controllers/ExpendController');
const auth = require('../middlewares/authall');

router.post("/get-expends", auth, catchErrors(controller.getExpends));
router.post("/get-expend", auth, catchErrors(controller.getExpend));
router.post("/search-expend", auth, catchErrors(controller.searchExpend));
router.post("/get-expend-done", auth, catchErrors(controller.getExpendDone));
router.post("/check-expend", auth, catchErrors(controller.checkExpend));
router.post("/update-expend", auth, catchErrors(controller.updateExpend));
router.post("/get-sent-expend", auth, catchErrors(controller.getSentExpend));
router.get("/show-client-expend", catchErrors(controller.showClientExpend));
router.post("/send-expend", auth, catchErrors(controller.sendExpend));
router.post("/get-client-expend", catchErrors(controller.getClientExpend));

module.exports = router;