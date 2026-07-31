/**
 * @fileoverview Nodemailer email service using Gmail SMTP.
 * Provides a reusable sendEmail function with async/await and error handling.
 */

const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let transporter = null;

/**
 * Initialize the Nodemailer transporter with Gmail SMTP.
 * @returns {object} Nodemailer transporter instance
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Verify SMTP connection.
 * @returns {Promise<boolean>} True if connection is valid
 */
const verifyConnection = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log('Email service: SMTP connection verified');
    return true;
  } catch (error) {
    console.error('Email service: SMTP connection failed:', error.message);
    return false;
  }
};

/**
 * Send an email using Gmail SMTP.
 * @param {object} options - Email options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @param {string} [options.from] - Sender address (optional, defaults to EMAIL_FROM)
 * @param {object[]} [options.attachments] - Attachments (optional)
 * @returns {Promise<object>} Result object with success status and messageId or error
 */
const sendEmail = async ({ to, subject, text, html, from, attachments }) => {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: from || env.EMAIL_FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html: html || text,
      attachments: attachments || [],
    };

    const info = await transport.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Email service sendEmail error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * Send a templated email.
 * @param {object} options - Email options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name (without extension)
 * @param {object} options.data - Data to inject into template
 * @param {string} [options.from] - Sender address (optional)
 * @returns {Promise<object>} Result object with success status
 */
const sendTemplatedEmail = async ({ to, subject, template, data, from }) => {
  try {
    const fs = require('fs');
    const path = require('path');

    const templatePath = path.join(__dirname, '..', 'templates', `${template}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });

    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    return sendEmail({ to, subject, text, html, from });
  } catch (error) {
    console.error('Email service sendTemplatedEmail error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  verifyConnection,
  getTransporter,
};