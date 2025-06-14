const axios = require('axios');

module.exports = async function (context, req) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN; // Set your access token in environment settings

    if (req.method === 'POST') {
        const { items } = req.body;
        const preference = {
            items: items.map(item => ({
                title: item.title,
                quantity: item.quantity,
                unit_price: item.unit_price
            }))
        };
        
        try {
            const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preference, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            context.res = {
                status: 200,
                body: { preferenceId: response.data.id }
            };
        } catch (error) {
            context.res = {
                status: 500,
                body: { error: error.message }
            };
        }
    } else {
        context.res = { status: 405, body: { error: 'Method not allowed' } };
    }
};
