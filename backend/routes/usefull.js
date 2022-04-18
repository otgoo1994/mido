const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const controller  = require('../controllers/usefullController');
const auth = require('../middlewares/authall');

router.post("/calendar", auth, catchErrors(controller.calendar));
router.post("/add-event", auth, catchErrors(controller.addEvent));
router.post("/delete-event", auth, catchErrors(controller.deleteEvent));
router.post("/shops", auth, catchErrors(controller.shops));
router.post("/edit-shop", auth, catchErrors(controller.editShops));
router.post("/get-total-time", auth, catchErrors(controller.getTotalTime));
router.post("/update-font-time", auth, catchErrors(controller.addFontTime));
router.post("/get-meal-money", auth, catchErrors(controller.getMealMoney));
router.post("/companies", auth, catchErrors(controller.companies));
router.post("/delete-company", auth, catchErrors(controller.deleteCompany));
router.post("/edit-company", auth, catchErrors(controller.editCompany));
router.post("/add-company", auth, catchErrors(controller.addCompany));
router.post("/get-brand-and-category", auth, catchErrors(controller.getBrandAndCategory));
router.post("/edit-brand", auth, catchErrors(controller.EditBrand));
router.post("/delete-brand", auth, catchErrors(controller.deleteBrand));
router.post("/edit-category", auth, catchErrors(controller.editCategory));
router.post("/delete-category", auth, catchErrors(controller.deleteCategory));
router.post("/edit-sub-category", auth, catchErrors(controller.editSubCategory));
router.post("/delete-sub-category", auth, catchErrors(controller.deleteSubCategory));
router.post("/get-brands", auth, catchErrors(controller.getBrands));
router.post("/get-categories", auth, catchErrors(controller.getCategories));
router.post("/get-sub-categories", auth, catchErrors(controller.getSubCategories));
router.post("/get-all-product", auth, catchErrors(controller.getAllProducts));


module.exports = router;