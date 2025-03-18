/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer'
import config from '../config'
import { TEmailFormate } from '../interface/emailFormat'
import AppError from '../errors/AppError'

const sendEmail = async (to: string, emailTemplate: TEmailFormate) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.email_host_provider_name as string,
      port: Number(config.email_host_provider_port),
      // secure: config.NODE_ENV === 'production' || false,
      secure: false,
      // secure: true,
      auth: {
        user: config.email_sender_email,
        pass: config.email_sender_email_app_pass
      }
    })

    // send mail with defined transport object
    await transporter.sendMail({
      from: config.email_sender_email, // sender address
      to, // list of receivers
      subject: emailTemplate.subject, // Subject line
      text: emailTemplate?.text ? emailTemplate.text : '', // plain text body
      html: emailTemplate.emailBody // html body
    })
  } catch (err: any) {
    throw new AppError(400, err.message)
  }
}

export default sendEmail
