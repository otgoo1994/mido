const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const controller  = require('../controllers/DashboardController');
const auth = require('../middlewares/authall');

router.post("/ecommerce", auth, catchErrors(controller.ecommerce));
router.post("/customer-dashboard", auth, catchErrors(controller.getCustomerDashboard));
router.post("/download-image", auth, catchErrors(controller.getImageFromItlab));

module.exports = router;