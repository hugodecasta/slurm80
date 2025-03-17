import * as fs from 'fs'
import nodemailer from 'nodemailer'

try {
    const credentials = Object.fromEntries(fs.readFileSync('DATA', 'utf8').split('\n').map(l => l.split('=')))
    const requestData = JSON.parse(fs.readFileSync('last_request.json', 'utf8'))
    const transporter = nodemailer.createTransport({
        host: credentials.smtpHost,
        port: credentials.smtpPort,
        secure: false,
        auth: {
            user: credentials.username,
            pass: credentials.password
        }
    })
    await transporter.sendMail({
        from: credentials.username,
        to: credentials.admin_mail,
        subject: 'Last Request',
        text: JSON.stringify(requestData, null, 2)
    })

    console.log('Email sent')
} catch (err) {
    console.error('Error:', err)
}