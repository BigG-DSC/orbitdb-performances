const getdata = async (connection, req) => {

    try {
        const ids = req.body.ids;
        
        return await connection.database.query((doc) => parseInt(doc.views, 10) <= ids);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message;
    }
}

exports.getdata = getdata