const mongoose = require("mongoose");

const leaveSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        require: true
    },
    toDate: {
        type: Date,
        required: true
    },
    remark: {
        type: String
    },
    approved: {
        type: String
    },
    approvedBy: {
        type: String
    }
})

module.exports = mongoose.model("leave", leaveSchema);