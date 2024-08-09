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
        // Log para verificar os valores recebidos
        console.log('Dados recebidos:', {
            recipientEmail,
            postalCode,
            createdAt,
            streetAddress,
            number,
            district,
            transactionId,
            givenName,
            amount,
            cityUF
        });

        // Carregar o arquivo HTML e substituir os placeholders
        let htmlBody = fs.readFileSync(path.join(__dirname, 'emailTemplate.html'), 'utf8');

        // Substituição dos placeholders pelos valores passados
        htmlBody = htmlBody.replace('945645546', transactionId);
        htmlBody = htmlBody.replace('Oct 21, 2017', createdAt);
        htmlBody = htmlBody.replace('$80.67', amount);
        htmlBody = htmlBody.replace('Andry Petrin', givenName);
        htmlBody = htmlBody.replace('78 Somewhere St', `${streetAddress}, ${number}`);
        htmlBody = htmlBody.replace('Somewhere, Canada 99743', `${district}, ${cityUF} ${postalCode}`);

        // Configuração do transportador do Nodemailer
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

        // Configurações do email
        const mailOptions = {
            from: senderEmail,
            to: recipientEmail,
            subject: subject,
            html: htmlBody,
        };

        // Enviar o email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado com sucesso.');
        console.log('Info object:', info);

        // Conectar ao IMAP para mover o email enviado para a pasta "Enviados"
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
                    console.error('Erro ao abrir a pasta "Enviados":', err);
                    imap.end();
                    return;
                }

                const emailMessage = `From: ${senderEmail}\r\nTo: ${recipientEmail}\r\nSubject: ${subject}\r\n\r\n${htmlBody}`;

                imap.append(emailMessage, { mailbox: 'Sent' }, (appendErr) => {
                    if (appendErr) {
                        console.error('Erro ao mover o email para a pasta "Enviados":', appendErr);
                    } else {
                        console.log('Email movido para a pasta "Enviados".');
                    }
                    imap.end();
                });
            });
        });

        imap.once('error', (imapErr) => {
            console.error('Erro de IMAP:', imapErr);
            if (imapErr.source === 'timeout') {
                console.log('Ignorando erro de timeout de IMAP.');
            }
            imap.end();
        });

        imap.connect();
    } catch (error) {
        console.error('Erro ao enviar o email:', error);
    }
}

module.exports = sendEmail;

