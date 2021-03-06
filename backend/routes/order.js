const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const orderController  = require('../controllers/orderController');
const auth = require('../middlewares/authall');

router.post("/create-order", auth, catchErrors(orderController.createOrder));
router.post("/create-movement", auth, catchErrors(orderController.createMovement));
router.post("/get-order", auth, catchErrors(orderController.getOrders));
router.post("/get-movement", auth, catchErrors(orderController.getMovements));
router.post("/search-order", auth, catchErrors(orderController.searchOrder));
router.post("/get-current-order", auth, catchErrors(orderController.getCurrentOrder));
router.post("/search-movement", auth, catchErrors(orderController.searchMovement));
router.post("/get-current-movement", auth, catchErrors(orderController.getCurrentMovement));
router.post("/disable-order", auth, catchErrors(orderController.disableOrder));
router.post("/change-order-qty", auth, catchErrors(orderController.changeQtyOrder));
router.post("/change-movement-qty", auth, catchErrors(orderController.changeQtyMovement));
router.post("/confirm-order", auth, catchErrors(orderController.confirmOrder));
router.post("/confirm-movement", auth, catchErrors(orderController.confirmMovement));
router.post("/disable-movement", auth, catchErrors(orderController.disableMovement));
router.post("/received-movement", auth, catchErrors(orderController.receivedMovement));
router.post("/wrote-movement", auth, catchErrors(orderController.wroteMovement));
router.post("/create-qpay-bill", auth, catchErrors(orderController.createQpayBill));
router.post("/check-qpay-bill", auth, catchErrors(orderController.checkQpayBill));
router.get("/qpay-result", catchErrors(orderController.qpayWebhook));
router.post("/get-import-edit", auth, catchErrors(orderController.getImportEdit));
router.post("/add-product-to-import", auth, catchErrors(orderController.addProductToImport));
router.post("/remove-product-from-import", auth, catchErrors(orderController.removeProductFromImport));
router.post("/update-import-order", auth, catchErrors(orderController.updateImportOrder));
router.post("/end-import-order", auth, catchErrors(orderController.endImportOrder));
router.post("/get-imports", auth, catchErrors(orderController.getImports));
router.post("/search-imports", auth, catchErrors(orderController.searchImports));
router.post("/delete-import", auth, catchErrors(orderController.deleteImport));
router.post("/change-import-status", auth, catchErrors(orderController.changeImportStatus));
router.post("/get-current-import", auth, catchErrors(orderController.getCurrentImport));
router.post("/get-rma-product", auth, catchErrors(orderController.getRmas));
router.post("/add-rma-product", auth, catchErrors(orderController.addRma));
router.post("/get-rma-current-product", auth, catchErrors(orderController.getRmaProduct));
router.post("/wrote-rma", auth, catchErrors(orderController.wroteRma));
router.post("/change-rma-status", auth, catchErrors(orderController.changeRmaStatus));
router.post("/sent-rma-product", auth, catchErrors(orderController.sentRma));
router.post("/delete-rma-product", auth, catchErrors(orderController.deleteRma));
router.post("/end-order", auth, catchErrors(orderController.EndOrder));
router.post("/customer-reports", auth, catchErrors(orderController.getCustomerReports));
router.post("/add-customer-report", auth, catchErrors(orderController.addCustomerReport));
router.post("/show-customer-report", auth, catchErrors(orderController.showCustomerReport));
router.post("/get-customer-expend", auth, catchErrors(orderController.getCustomerExpends));
router.post("/get-customer-revenue", auth, catchErrors(orderController.getCustomerRevenues));
router.post("/get-customer-new-revenue", auth, catchErrors(orderController.getNewRevenue));
router.post("/add-customer-revenue-product", auth, catchErrors(orderController.addProductToRevenue));
router.post("/remove-customer-revenue-product", auth, catchErrors(orderController.removeProductFromRevenue));
router.post("/update-customer-revenue-product", auth, catchErrors(orderController.updateRevenueQty));
router.post("/add-new-customer-revenue", auth, catchErrors(orderController.addCustomerRevenue));

module.exports = router;