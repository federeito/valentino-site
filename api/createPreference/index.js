const axios = require('axios');

module.exports = async function (context, req) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            body: { error: 'Method not allowed. Use POST.' }
        };
        return;
    }
    
    if (!req.body || !req.body.items || !Array.isArray(req.body.items)) {
        context.res = {
            status: 400,
            body: { error: 'Invalid request body. Expected JSON with an items array.' }
        };
        return;
    }

    for (let item of req.body.items) {
        if (!item.title || typeof item.quantity !== 'number' || typeof item.unit_price !== 'number' || !item.currency_id) {
            context.res = {
                status: 400,
                body: { error: 'Each item must have title, quantity (number), unit_price (number), and currency_id.' }
            };
            return;
        }
    }

    const preference = {
        items: req.body.items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: item.currency_id
        }))
    };

    try {
        context.log('Creating Mercado Pago preference with payload:', JSON.stringify(preference));
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preference, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        context.log('Mercado Pago response:', response.data);
        context.res = {
            status: 200,
            body: { preferenceId: response.data.id }
        };
    } catch (error) {
        context.log('Error creating Mercado Pago preference:', error.response ? error.response.data : error.message);
        context.res = {
            status: 500,
            body: {
                error: error.message,
                details: error.response ? error.response.data : null
            }
        };
    }
};
