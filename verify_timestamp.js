import fetch from 'node-fetch';

async function testTimestamp() {
    try {
        const response = await fetch('http://localhost:5000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 500,
                originalAmount: '500.00',
                discountAmount: '3.50',
                finalAmount: '496.50',
                savings: '3.50',
                fuelPrice: '100.00',
                discountPerLiter: '0.70',
                liters: '5.00'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transaction created:', data);

        if (data.timestampStr) {
            console.log('PASS: timestampStr is present:', data.timestampStr);
        } else {
            console.log('FAIL: timestampStr is missing');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Wait for server to start
setTimeout(testTimestamp, 5000);
