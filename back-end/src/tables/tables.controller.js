const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Lists out the tables (already in order)
 */
async function list (req, res) {
    const response = await service.list();

    res.json({ data: response });
};

module.exports = {
    list: [asyncErrorBoundary(list)],
};
