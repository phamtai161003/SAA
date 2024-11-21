const express = require('express');
const { downloadDataset } = require('../controllers/datasetController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Định nghĩa route
router.get('/dataset/download', authenticate, downloadDataset);

module.exports = router;
