const getalldata = async (connection) => {

    try {
        await connection.database.load();
        const result = await connection.database.get('');
        console.log(result);
        return result;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message;
    }
}

exports.getalldata = getalldata