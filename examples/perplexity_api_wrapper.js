const { spawn } = require('child_process');
const path = require('path');

class PerplexityAPIWrapper {
    constructor() {
        this.scriptPath = path.join(__dirname, 'perplexity_api.py');
    }
    
    async getCompanyInfo(companyName) {
        return new Promise((resolve, reject) => {
            const python = spawn('python3', [this.scriptPath, 'company', companyName]);
            
            let output = '';
            let errorOutput = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
                    return;
                }
                
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON output: ${error.message}`));
                }
            });
        });
    }
    
    async generateCustomerCompanies(userCompany, productInfo) {
        return new Promise((resolve, reject) => {
            // Convert data to JSON string to pass to Python script
            const inputData = JSON.stringify({ userCompany, productInfo });
            const python = spawn('python3', [this.scriptPath, 'customers', inputData]);
            
            let output = '';
            let errorOutput = '';
            
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
                    return;
                }
                
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON output: ${error.message}`));
                }
            });
        });
    }
}

module.exports = PerplexityAPIWrapper;
