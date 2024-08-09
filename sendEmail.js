const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

// Email configuration
const senderEmail = 'contato@eudorabrasil.space';
const senderPassword = '123qwe!@#QWE'; // Substitua pela senha correta
const subject = 'Congratulations!';
const smtpServer = 'smtp.titan.email';
const smtpPort = 587;
const imapServer = 'imap.titan.email';
const imapPort = 993;

// Ler o arquivo HTML em uma variável
const htmlBody = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf8');

async function sendEmail(recipientEmail) {
    try {
        console.log(`Attempting to send email to ${recipientEmail}`);

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
            to: recipientEmail,  // Usando o email recebido na requisição
            subject: subject,
            html: htmlBody,
        };

        // Enviar o email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
        console.log('Info object:', info);

        // Adicionar o email enviado à pasta "Enviados" usando IMAP
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
