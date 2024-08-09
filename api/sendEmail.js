import sendEmail from '../sendEmail';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Tentativa de leitura dos dados do corpo da requisição
            const {
                recipientEmail,
                postalCode,
                createdAt,
                number,
                district,
                transactionId,
                givenName,
                amount,
                cityUF,
            } = req.body;

            // Verificação básica dos parâmetros
            if (!recipientEmail) {
                return res.status(400).json({ message: 'Recipient email is required' });
            }

            // Debugging: Log dos parâmetros recebidos
            console.log('Parameters received:', {
                recipientEmail,
                postalCode,
                createdAt,
                number,
                district,
                transactionId,
                givenName,
                amount,
                cityUF,
            });

            // Chamada à função para enviar o email
            await sendEmail({
                recipientEmail,
                postalCode,
                createdAt,
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
