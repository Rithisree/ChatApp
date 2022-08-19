const testing = async(req,res) => {
    console.log("Hello, I'm testing Middleware")

    return res.status(200).json({
        "status":true,
        "data":"Middleware Done"
    })
}

module.exports = {testing}