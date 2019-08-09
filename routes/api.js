const express = require("express");
const router = express.Router();
const checkAuth = require("./../middleware/check-auth");
var nodemailer = require('nodemailer');

const Leave = require("./../models/leaves");
const User = require("./../models/user");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(from, to, subject, body){

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `<${from}>`, // sender address
        to: `${to}`, // list of receivers
        subject: `${subject}`, // Subject line
        html: `${body}` // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
  

router.post("/leaves", checkAuth, (req, res, next) => {
    let { fromDate, toDate, remark } = req.body;
    let { userId } = req.query;
    const leave = new Leave({
        fromDate,
        toDate,
        remark,
        userId
    })
    User.findOne({_id: userId})
        .exec()
        .then(
            loggedInUser => {
                User.findOne({_id: loggedInUser.reportingTo})
                    .exec()
                    .then(
                        parent => {
                            leave.save()
                                .then(
                                    result => {
                                        res.status(201).json({
                                            message: "Leave marked successfully"
                                        })

                                        let subject = "Please approve the leave";
                                        let body = `
                                            <h1>Please approve the leave</h1>
                                            <p>Please approve the mail clicking on below link</p>
                                            <a href="https://www.w3schools.com" target="_blank">Visit W3Schools</a>
                                        `;
                                        sendMail(loggedInUser.email, parent.email, subject, body).catch(console.error);
                                    },
                                    error => {
                                        res.status(500).json({
                                            error: error
                                        })
                                    }
                                )
                        }
                    )
            }
        )
})

router.get("/leaves", checkAuth, (req, res, next) => {
    let { userId } = req.query;
    Leave.find({userId})
        .exec()
        .then(
            result => {
                return res.status(200).json({
                    data: result
                })
            },
            err => {
                return res.status(500).json({
                    error: err
                })
            }
        )
})

router.delete("/leaves/:id", checkAuth, (req, res, next) => {
    let { userId } = req.query;
    console.log(userId);
    Leave.deleteOne({_id: req.params.id, userId})
        .exec()
        .then(
            res.status(200).json({
                message: "Leave deleted successfully"
            })
        )
        .catch(err => {
            res.status(500).json({
                message: "Error in deletion"
            })
        })
})

router.put("/leaves/:id", checkAuth, (req, res, next) => {
    let leaveId = req.params.id;
    Leave.findOneAndUpdate({_id: leaveId}, {...req.body})
        .exec()
        .then(
            result => {
                res.status(200).json({
                    message: "Leave data updated successfully"
                })
            },
            err => {
                res.status(500).json({
                    message: "Error in deletion"
                })
            }
        )
})


module.exports = router;