const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');


router.post('/', async (req, res) => {
    try {
        const { invoiceDate, invoiceNumber, invoiceAmount } = req.body;

        const existingInvoice = await Invoice.findOne({ invoiceNumber });
        if (existingInvoice) {
            return res.status(400).json({ error: 'Invoice number already exists for this financial year.' });
        }

        const previousInvoice = await Invoice.findOne({
            invoiceNumber: { $lt: invoiceNumber },
        }).sort({ invoiceDate: -1 });

        const nextInvoice = await Invoice.findOne({
            invoiceNumber: { $gt: invoiceNumber },
        }).sort({ invoiceDate: 1 });

        if (previousInvoice && invoiceDate < previousInvoice.invoiceDate) {
            return res.status(400).json({ error: 'Invoice date is earlier than the previous invoice.' });
        }

        if (nextInvoice && invoiceDate > nextInvoice.invoiceDate) {
            return res.status(400).json({ error: 'Invoice date is later than the next invoice.' });
        }

        const newInvoice = new Invoice({
            invoiceDate,
            invoiceNumber,
            invoiceAmount,
        });

        const savedInvoice = await newInvoice.save();
        res.json(savedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Could not create the invoice.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve invoices.' });
    }
});

router.put('/:invoiceNumber', async (req, res) => {
    try {
        const { invoiceDate, invoiceAmount } = req.body;
        const { invoiceNumber } = req.params;

        const updatedInvoice = await Invoice.findOneAndUpdate(
            { invoiceNumber: invoiceNumber },
            { invoiceDate, invoiceAmount },
            { new: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Could not update the invoice.' });
    }
});

router.delete('/:invoiceNumber', async (req, res) => {
    try {
        const { invoiceNumber } = req.params;

        const deletedInvoice = await Invoice.findOneAndRemove({ invoiceNumber: invoiceNumber });

        if (!deletedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(deletedInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Could not delete the invoice.' });
    }
});


module.exports = router;
