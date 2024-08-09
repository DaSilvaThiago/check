const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

// Email configuration
const senderEmail = 'contato@eudorabrasil.space';
const senderPassword = '123qwe!@#QWE'; // Substitua pela senha correta
const subject = 'Obrigado pela Compra!';
const smtpServer = 'smtp.titan.email';
const smtpPort = 587;
const imapServer = 'imap.titan.email';
const imapPort = 993;

async function sendEmail({
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
}) {
    try {
        console.log(`Attempting to send email to ${recipientEmail}`);

        // Carregar o arquivo HTML e substituir os placeholders
        let htmlBody = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf8');

        htmlBody = htmlBody.replace('945645546', transactionId);
        htmlBody = htmlBody.replace('Oct 21, 2017', createdAt);
        htmlBody = htmlBody.replace('$80.67', amount);
        htmlBody = htmlBody.replace('Andry Petrin', givenName);
        htmlBody = htmlBody.replace('78 Somewhere St', `${streetAddress}, ${number}`);
        htmlBody = htmlBody.replace('Somewhere, Canada 99743', `${district}, ${cityUF} ${postalCode}`);

        const transporter = nodemailer.createTransport({
            host: smtpServer,
            port: smtpPort,
            auth: {
                user: senderEmail,
                pass: senderPassword,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: senderEmail,
            to: recipientEmail,
            subject: subject,
            html: htmlBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
        console.log('Info object:', info);

        const imap = new Imap({
            user: senderEmail,
            password: senderPassword,
            host: imapServer,
            port: imapPort,
            tls: true,
        });

        imap.once('ready', () => {
            imap.openBox('Sent', true, (err) => {
                if (err) {
                    console.error('Error opening "Sent" folder:', err);
                    imap.end();
                    return;
                }

                const emailMessage = `From: ${senderEmail}\r\nTo: ${recipientEmail}\r\nSubject: ${subject}\r\n\r\n${htmlBody}`;

                imap.append(emailMessage, { mailbox: 'Sent' }, (appendErr) => {
                    if (appendErr) {
                        console.error('Error appending email to "Sent" folder:', appendErr);
                    } else {
                        console.log('Email appended to "Sent" folder.');
                    }
                    imap.end();
                });
            });
        });

        imap.once('error', (imapErr) => {
            console.error('IMAP Error:', imapErr);
            if (imapErr.source === 'timeout') {
                console.log('Ignoring IMAP timeout error.');
            }
            imap.end();
        });

        imap.connect();
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


module.exports = sendEmail;
