const storeData = async (connection,req) => {

    try {
        const token = req.body.token;
        const content = req.body.content;
        const testNumber = req.body.testNumber;

        await connection.database.put({ _id: token, doc: content, views: testNumber })

        return "Record { _id: ${token}, doc: ${content}, views: ${testNumber} } stored"
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message
    }
}

exports.storeData = storeData