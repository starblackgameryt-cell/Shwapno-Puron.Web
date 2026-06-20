import { db } from '@/lib/db'

// Admin login notification - creates notification in database and generates email
export async function POST(request: Request) {
  try {
    const { ip, userAgent, time } = await request.json()

    const loginTime = time ? new Date(time) : new Date()
    const formattedTime = loginTime.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    // Create notification in database
    await db.adminNotification.create({
      data: {
        type: 'login',
        message: 'অ্যাডমিন সফলভাবে লগইন হয়েছে',
        details: `IP: ${ip || 'unknown'}, ডিভাইস: ${userAgent || 'unknown'}, সময়: ${formattedTime}`,
      },
    })

    // Generate Gmail compose URL for notification email
    const emailTo = 'dolamaanha@gmail.com'
    const emailSubject = encodeURIComponent('🔒 স্বপ্ন পূরণ - অ্যাডমিন লগইন সতর্কতা')
    const emailBody = encodeURIComponent(
      `স্বপ্ন পূরণ অ্যাডমিন লগইন সতর্কতা\n\n` +
      `অ্যাডমিন সফলভাবে লগইন করেছেন।\n\n` +
      `বিস্তারিত:\n` +
      `- সময়: ${formattedTime}\n` +
      `- IP ঠিকানা: ${ip || 'unknown'}\n` +
      `- ডিভাইস: ${userAgent || 'unknown'}\n\n` +
      `যদি আপনি এই লগইন না করে থাকেন, অবিলম্বে পাসওয়ার্ড পরিবর্তন করুন।\n\n` +
      `- স্বপ্ন পূরণ সিকিউরিটি সিস্টেম`
    )

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTo}&su=${emailSubject}&body=${emailBody}`

    // Try to send actual email using nodemailer (if SMTP credentials are configured)
    let emailSent = false
    try {
      // Check if SMTP is configured via environment variables
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from: `"স্বপ্ন পূরণ সিকিউরিটি" <${process.env.SMTP_USER}>`,
          to: emailTo,
          subject: '🔒 স্বপ্ন পূরণ - অ্যাডমিন লগইন সতর্কতা',
          text: `অ্যাডমিন সফলভাবে লগইন করেছেন।\n\nসময়: ${formattedTime}\nIP: ${ip || 'unknown'}\nডিভাইস: ${userAgent || 'unknown'}\n\nযদি আপনি এই লগইন না করে থাকেন, অবিলম্বে পাসওয়ার্ড পরিবর্তন করুন।`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #fafaf9; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 56px; height: 56px; background: #1c1917; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 20px; font-weight: 900;">স্ব</span>
                </div>
                <h2 style="color: #1c1917; margin: 12px 0 4px;">স্বপ্ন পূরণ</h2>
                <p style="color: #78716c; font-size: 14px;">অ্যাডমিন লগইন সতর্কতা</p>
              </div>
              <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e7e5e4;">
                <p style="color: #1c1917; font-weight: 600; margin-bottom: 16px;">🔒 অ্যাডমিন সফলভাবে লগইন করেছেন</p>
                <div style="background: #f5f5f4; border-radius: 8px; padding: 12px; font-size: 13px; color: #57534e;">
                  <p style="margin: 4px 0;"><strong>সময়:</strong> ${formattedTime}</p>
                  <p style="margin: 4px 0;"><strong>IP:</strong> ${ip || 'unknown'}</p>
                  <p style="margin: 4px 0;"><strong>ডিভাইস:</strong> ${userAgent || 'unknown'}</p>
                </div>
                <p style="color: #dc2626; font-size: 12px; margin-top: 16px;">⚠️ যদি আপনি এই লগইন না করে থাকেন, অবিলম্বে পাসওয়ার্ড পরিবর্তন করুন।</p>
              </div>
            </div>
          `,
        })
        emailSent = true
      }
    } catch (emailError) {
      console.error('Email send error (non-critical):', emailError)
    }

    return Response.json({
      success: true,
      emailSent,
      gmailComposeUrl,
      message: emailSent
        ? 'লগইন নোটিফিকেশন ইমেইল পাঠানো হয়েছে'
        : 'নোটিফিকেশন সংরক্ষিত হয়েছে',
    })
  } catch (error) {
    console.error('Notify login error:', error)
    return Response.json({ error: 'নোটিফিকেশন তৈরি করতে সমস্যা হয়েছে' }, { status: 500 })
  }
}
