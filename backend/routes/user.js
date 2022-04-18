const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const userController  = require('../controllers/user');
const auth = require('../middlewares/authall');
// const payment = require('../middlewares/auth');

// route
router.post("/login",catchErrors(userController.login));
router.post("/get-all-users", auth, catchErrors(userController.getAllUser));
router.post("/update-user-store", auth, catchErrors(userController.updateUserStore));
router.post("/start-time-register", auth, catchErrors(userController.startTimeRegister));
router.post("/end-time-register", auth, catchErrors(userController.endTimeRegister));
router.post("/new-contact-info", auth, catchErrors(userController.newContactInfo));
router.post("/add-contact", auth, catchErrors(userController.addContact));
router.post("/get-badges", auth, catchErrors(userController.getBadges));
router.post("/profile", auth, catchErrors(userController.profile));
router.post("/update-user-info", auth, catchErrors(userController.updateUserInfo));
router.post("/update-profile-image", auth, catchErrors(userController.updateProfileImage));
router.post("/forgot-password", catchErrors(userController.forgotPassword));
router.post("/update-password", auth, catchErrors(userController.changePassword));
router.post("/check-official-password", auth, catchErrors(userController.checkOfficialPassword));
router.post("/get-notify", auth, catchErrors(userController.getNotify));
router.post("/get-home-info", catchErrors(userController.getHomeInfo));
router.post("/delete-user", catchErrors(userController.deleteUser));
router.post("/update-user-brand", catchErrors(userController.updateUserBrands));

module.exports = router;