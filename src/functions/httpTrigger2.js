const { app } = require('@azure/functions');
const sql = require('mssql');
require('dotenv').config(); // Load .env file


// Database configuration
const dbConfig = {
    user: process.env.DB_USER, // Use environment variables for sensitive information
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use encryption for Azure SQL
        trustServerCertificate: false // Change to true if you encounter certificate issues
    }
};

app.http('httpTrigger2', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        let resultMessage;
        try {
            // Connect to the database
            const pool = await sql.connect(dbConfig);
            context.log('got cobbection-------')
            // Execute a query
            const result = await pool.request().query('SELECT * FROM Persons');
            console.log(result.recordset);
                    
            // Check if any rows were returned
            if (result.recordset.length > 0) {
                resultMessage = `User found: ${JSON.stringify(result.recordset[0].firstName)}`;
            } else {
                resultMessage = 'No user found with that name.';
            }
        } catch (err) {
            context.error('SQL query failed', err);
            resultMessage = 'Error querying database.';
        }

        return { body: `Hello everyone, ${name}! ${resultMessage}` };
    }
});
