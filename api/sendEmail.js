import sendEmail from '../sendEmail';

export default async function handler(req, res) {
    if (req.method === 'POST') {
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

        if (!recipientEmail) {
            return res.status(400).json({ message: 'Recipient email is required' });
        }

        try {
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
            res.status(500).json({ message: 'Error sending email', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
