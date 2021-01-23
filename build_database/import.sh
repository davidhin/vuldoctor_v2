mongoimport --uri "mongodb+srv://davidhin:$MONGODB_PASSWORD@vulcluster.zqpux.mongodb.net/main?retryWrites=true&w=majority" --collection cve --drop --file cve.json --jsonArray
mongoimport --uri "mongodb+srv://davidhin:$MONGODB_PASSWORD@vulcluster.zqpux.mongodb.net/main?retryWrites=true&w=majority" --collection cpe --drop --file cpe.json --jsonArray
mongoimport --uri "mongodb+srv://davidhin:$MONGODB_PASSWORD@vulcluster.zqpux.mongodb.net/main?retryWrites=true&w=majority" --collection cvecpe --drop --file cvecpe.json --jsonArray
