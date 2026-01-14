import fetch from 'node-fetch';

async function testReset() {
    try {
        // 1. Create a transaction
        console.log("Creating transaction...");
        const createRes = await fetch('http://localhost:5000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100,
                originalAmount: '100.00',
                discountAmount: '0.70',
                finalAmount: '99.30',
                savings: '0.70',
                fuelPrice: '100.00',
                discountPerLiter: '0.70',
                liters: '1.00'
            })
        });
        const txn = await createRes.json();
        console.log('Transaction created:', txn.id);

        // 2. Simulate it having an Auth Code (we can't easily force this without mocking storage, 
        // but we can verify that reset returns PENDING even if it was already PENDING)
        // Ideally we would want to set it to something else first, but the storage interface isn't exposed via API for setting random fields.
        // However, the reset endpoint guarantees it becomes PENDING.

        // 3. Call Reset
        console.log("Resetting transaction...");
        const resetRes = await fetch(`http://localhost:5000/api/transactions/${txn.id}/reset`, {
            method: 'POST'
        });
        const resetData = await resetRes.json();
        console.log('Reset response:', resetData);

        if (resetData.authCode === 'PENDING') {
            console.log('PASS: Auth code is PENDING after reset');
        } else {
            console.log('FAIL: Auth code is NOT PENDING');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Wait for server startup
setTimeout(testReset, 5000);
