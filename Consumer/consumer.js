const axios = require('axios');

let lastOffset = 1;
const type = 'email';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processEvent(event) {
    if (Math.random() < 0.2) {
        throw new Error(`Processing failed at offset ${event.offset}`);
    }

    console.log(`Processed offset ${event.offset}`);
}

async function sendToDLQ(event, reason) {
    try {
        await axios.post('http://localhost:3000/dlq', {
            type: event.type,
            data: event.data,
            offset: event.offset,
            reason
        });

        console.log(`Moved offset ${event.offset} to DLQ`);
    } catch (err) {
        console.log(`DLQ failed for offset ${event.offset}:`, err.message);
    }
}

async function consume() {
    while (true) {
        try {
            const response = await axios.get(
                `http://localhost:3000/consume?offset=${lastOffset}&type=${type}`
            );

            const events = response.data;

            if (!events || events.length === 0) {

                await sleep(2000);
                continue;
            }

            for (const event of events) {
                let success = false;
                let attempts = 0;

                while (!success && attempts < 3) {
                    try {
                        await processEvent(event);

                        lastOffset = event.offset;

                        success = true;
                    } catch (err) {
                        attempts++;
                        console.log(`Retry ${attempts} for offset ${event.offset}`);
                    }
                }

                if (!success) {
                    await sendToDLQ(event, "Max retries exceeded");

                    lastOffset = event.offset;
                }
                await sleep(1000);
            }

        } catch (err) {
            console.log("Error fetching events:", err.message);
        }

        await sleep(2000);
    }
}

consume();