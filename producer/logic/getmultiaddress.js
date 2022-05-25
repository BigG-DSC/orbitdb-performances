const getmultiaddress = async (connection) => {

    try {
        const id = await connection.ipfs.id();
        console.log(id);
        return id;
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message;
    }
}

exports.getmultiaddress = getmultiaddress