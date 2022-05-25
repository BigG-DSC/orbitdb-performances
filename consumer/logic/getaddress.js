const getDbAddress = async (connection) => {

    try {
        console.log(connection.database.address.toString());
        return connection.database.address.toString()
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message
    }
}

exports.getDbAddress = getDbAddress