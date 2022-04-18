const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const controller  = require('../controllers/OfferController');
const auth = require('../middlewares/authall');

router.post("/check-offer", auth, catchErrors(controller.checkOffer));
router.post("/get-offer", auth, catchErrors(controller.getOffer));
router.post("/update-offer", auth, catchErrors(controller.updateOffer));
router.post("/get-offers", auth, catchErrors(controller.getOffers));
router.post("/get-offer-done", auth, catchErrors(controller.getOfferDone));
router.post("/check-official", auth, catchErrors(controller.checkOfficial));
router.post("/get-official", auth, catchErrors(controller.getOfficial));
router.post("/update-official", auth, catchErrors(controller.updateOfficial));
router.post("/get-officials", auth, catchErrors(controller.getOfficials));
router.post("/pin-to-official", auth, catchErrors(controller.pinToOffical));
router.post("/get-official-done", auth, catchErrors(controller.getOfficialDone));
router.post("/send-offer", auth, catchErrors(controller.sendOffer));
router.get("/show-client-offer", catchErrors(controller.showClientOffer));
router.post("/get-client-offer", catchErrors(controller.getClientOffer));
router.post("/search-offer", auth, catchErrors(controller.searchOffer));
router.post("/get-sent-offer", auth, catchErrors(controller.getSentOffers));

module.exports = router;