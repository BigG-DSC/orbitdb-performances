const getalldata = async (connection) => {

    try {
        await connection.database.load();
        
        return await connection.database.get('');
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message;
    }
}

exports.getalldata = getalldata