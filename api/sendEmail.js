import sendEmail from '../sendEmail';

export default async function handler(req, res) {
    // Adicionando cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite todos os domínios (ou substitua '*' por um domínio específico)
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Cabeçalhos permitidos

    // Responder ao preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST' || req.method === 'GET') {
        try {
            const {
                recipientEmail,
                postalCode,
                createdAt,
                number,
                district,
                streetAddress,
                transactionId,
                givenName,
                amount,
                cityUF,
            } = req.query;

            if (!recipientEmail) {
                return res.status(400).json({ message: 'Recipient email is required' });
            }

            await sendEmail({
                recipientEmail,
                postalCode,
                createdAt,
                streetAddress,
                number,
                district,
                transactionId,
                givenName,
                amount,
                cityUF,
            });
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ message: 'Error sending email', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
