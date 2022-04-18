const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandler');
const controller = require('../controllers/InvoiceController');
const auth = require('../middlewares/authall');

router.post("/check-invoice", auth, catchErrors(controller.checkInvoice));
router.post("/get-invoice", auth, catchErrors(controller.getInvoice));
router.post("/get-invoice-done", auth, catchErrors(controller.getInvoiceDone));
router.post("/add-new-company", auth, catchErrors(controller.addCompany));
router.post("/update-invoice", auth, catchErrors(controller.updateInvoice));
router.post("/get-invoices", auth, catchErrors(controller.getInvoices));
router.post("/send-to-mail", auth, catchErrors(controller.sendToMail));
router.post("/get-reports", auth, catchErrors(controller.getCashReports));
router.post("/update-report", auth, catchErrors(controller.updateReport));
router.post("/get-report", auth, catchErrors(controller.getCashReport));
router.post("/update-stat-report", auth, catchErrors(controller.updateCashReport));
router.post("/update-invoice-amount", auth, catchErrors(controller.updateInvoiceAmount));
router.post("/delete-invoice", auth, catchErrors(controller.deleteInvoice));
router.post("/send-invoice", auth, catchErrors(controller.sendInvoice));
router.get("/show-client-invoice", catchErrors(controller.showClientInvoice));
router.post("/get-client-invoice", catchErrors(controller.getClientInvoice));
router.post("/add-cash-report", auth, catchErrors(controller.addCashReport));
router.post("/search-invoice", auth, catchErrors(controller.searchInvoice));
router.post("/get-sent-invoice", auth, catchErrors(controller.getSentInvoice));

module.exports = router;